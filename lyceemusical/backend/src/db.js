// SQLite via Node's built-in driver (node:sqlite) — no native build step,
// and synchronous calls mean "check the per-person limit, then insert" runs
// without any interleaving inside this single-process server.
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const config = require('./config');

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
const db = new DatabaseSync(config.dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS orders (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    number           TEXT UNIQUE,
    session_id       TEXT UNIQUE,
    status           TEXT NOT NULL DEFAULT 'pending', -- pending | paid | expired | refunded
    email            TEXT NOT NULL,
    items            TEXT NOT NULL,                    -- JSON [{productId,name,size,qty,unitPrice}]
    cd_count         INTEGER NOT NULL,
    tshirt_count     INTEGER NOT NULL,
    subtotal         INTEGER NOT NULL,                 -- centimes
    shipping         INTEGER NOT NULL DEFAULT 0,
    total            INTEGER,
    customer_name    TEXT,
    phone            TEXT,
    shipping_address TEXT,                             -- JSON (format Stripe)
    payment_intent   TEXT,
    created_at       TEXT NOT NULL,
    expires_at       TEXT NOT NULL,
    paid_at          TEXT,
    notified_at      TEXT,
    fulfilled_at     TEXT,
    note             TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_orders_email  ON orders(email);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
`);

// Additive migrations — safe to run on every boot.
const columns = new Set(db.prepare('PRAGMA table_info(orders)').all().map((c) => c.name));
const addColumn = (name, type) => {
  if (!columns.has(name)) db.exec(`ALTER TABLE orders ADD COLUMN ${name} ${type}`);
};
addColumn('tracking', 'TEXT');
addColumn('refunded_at', 'TEXT');
addColumn('flags', "TEXT NOT NULL DEFAULT '[]'"); // JSON: anomalies to double-check
addColumn('invoice_id', 'TEXT');
db.exec('CREATE INDEX IF NOT EXISTS idx_orders_pi ON orders(payment_intent)');

const now = () => new Date().toISOString();

const hydrate = (row) =>
  row && {
    ...row,
    items: JSON.parse(row.items),
    shipping_address: row.shipping_address ? JSON.parse(row.shipping_address) : null,
    flags: JSON.parse(row.flags || '[]'),
  };

const stmts = {
  insert: db.prepare(`
    INSERT INTO orders (email, items, cd_count, tshirt_count, subtotal, shipping, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  setNumber: db.prepare('UPDATE orders SET number = ? WHERE id = ?'),
  attachSession: db.prepare('UPDATE orders SET session_id = ? WHERE id = ?'),
  deleteById: db.prepare("DELETE FROM orders WHERE id = ? AND status = 'pending'"),
  byId: db.prepare('SELECT * FROM orders WHERE id = ?'),
  bySession: db.prepare('SELECT * FROM orders WHERE session_id = ?'),
  byNumber: db.prepare('SELECT * FROM orders WHERE number = ?'),
  // Paid orders + checkouts still open on Stripe both "hold" quota, so two
  // tabs opened at once can't each squeeze in 3 more.
  usageForEmail: db.prepare(`
    SELECT COALESCE(SUM(cd_count), 0) AS cd, COALESCE(SUM(tshirt_count), 0) AS tshirt
    FROM orders
    WHERE email = ? AND (status = 'paid' OR (status = 'pending' AND expires_at > ?))
  `),
  markPaid: db.prepare(`
    UPDATE orders
    SET status = 'paid', paid_at = ?, total = ?, customer_name = ?, phone = ?,
        shipping_address = ?, payment_intent = ?, invoice_id = ?
    WHERE session_id = ? AND status IN ('pending', 'expired')
  `),
  byPaymentIntent: db.prepare('SELECT * FROM orders WHERE payment_intent = ?'),
  markRefunded: db.prepare("UPDATE orders SET status = 'refunded', refunded_at = ? WHERE id = ? AND status = 'paid'"),
  setFlags: db.prepare('UPDATE orders SET flags = ? WHERE id = ?'),
  pendingToReconcile: db.prepare(`
    SELECT * FROM orders
    WHERE status = 'pending' AND session_id IS NOT NULL AND created_at < ? AND created_at > ?
  `),
  markExpired: db.prepare("UPDATE orders SET status = 'expired' WHERE session_id = ? AND status = 'pending'"),
  markNotified: db.prepare('UPDATE orders SET notified_at = ? WHERE id = ?'),
  setFulfilled: db.prepare("UPDATE orders SET fulfilled_at = ?, tracking = ? WHERE number = ? AND status = 'paid'"),
  setNote: db.prepare('UPDATE orders SET note = ? WHERE number = ?'),
  listPaid: db.prepare("SELECT * FROM orders WHERE status = 'paid' ORDER BY paid_at ASC"),
  listAll: db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 2000'),
  listRefunded: db.prepare("SELECT * FROM orders WHERE status = 'refunded' ORDER BY refunded_at DESC"),
};

const orders = {
  usageForEmail(email) {
    return stmts.usageForEmail.get(email, now());
  },

  createPending({ email, items, counts, subtotal, shipping, expiresAt }) {
    const { lastInsertRowid } = stmts.insert.run(
      email,
      JSON.stringify(items),
      counts.cd,
      counts.tshirt,
      subtotal,
      shipping,
      now(),
      expiresAt.toISOString()
    );
    const id = Number(lastInsertRowid);
    const number = `LM-${String(id).padStart(4, '0')}`;
    stmts.setNumber.run(number, id);
    return hydrate(stmts.byId.get(id));
  },

  attachSession(id, sessionId) {
    stmts.attachSession.run(sessionId, id);
  },

  discard(id) {
    stmts.deleteById.run(id);
  },

  bySession(sessionId) {
    return hydrate(stmts.bySession.get(sessionId));
  },

  byNumber(number) {
    return hydrate(stmts.byNumber.get(number));
  },

  // Returns the order only when THIS call flipped it to paid — Stripe retries
  // webhooks, and we must notify the team exactly once.
  markPaid(sessionId, { total, name, phone, address, paymentIntent, invoiceId }) {
    const { changes } = stmts.markPaid.run(
      now(),
      total,
      name || null,
      phone || null,
      address ? JSON.stringify(address) : null,
      paymentIntent || null,
      invoiceId || null,
      sessionId
    );
    return changes ? orders.bySession(sessionId) : null;
  },

  markExpired(sessionId) {
    stmts.markExpired.run(sessionId);
  },

  markNotified(id) {
    stmts.markNotified.run(now(), id);
  },

  setFulfilled(number, fulfilled, tracking = null) {
    return stmts.setFulfilled.run(fulfilled ? now() : null, fulfilled ? tracking : null, number).changes > 0;
  },

  byPaymentIntent(pi) {
    return hydrate(stmts.byPaymentIntent.get(pi));
  },

  // Returns the order only on the transition, like markPaid.
  markRefunded(id) {
    return stmts.markRefunded.run(now(), id).changes ? hydrate(stmts.byId.get(id)) : null;
  },

  addFlag(id, flag) {
    const order = hydrate(stmts.byId.get(id));
    if (!order || order.flags.includes(flag)) return;
    stmts.setFlags.run(JSON.stringify([...order.flags, flag]), id);
  },

  // Pending checkouts old enough that the webhook should have arrived, and
  // young enough that the Stripe session still matters.
  pendingToReconcile() {
    const t = Date.now();
    return stmts.pendingToReconcile
      .all(new Date(t - 2 * 60e3).toISOString(), new Date(t - 48 * 3600e3).toISOString())
      .map(hydrate);
  },

  listRefunded() {
    return stmts.listRefunded.all().map(hydrate);
  },

  setNote(number, note) {
    return stmts.setNote.run(note, number).changes > 0;
  },

  listPaid() {
    return stmts.listPaid.all().map(hydrate);
  },

  listAll() {
    return stmts.listAll.all().map(hydrate);
  },
};

module.exports = { db, orders };
