// Back-office for the two people preparing parcels: order list, production
// summary (how many CDs / t-shirts per size to order) and a CSV export.
const crypto = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const { orders } = require('../db');
const { notifyShipped } = require('../notify');
const { TSHIRT_SIZES, getProduct } = require('../catalog');

const router = express.Router();

router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    // Only failed logins count against the budget.
    skipSuccessfulRequests: true,
  })
);

const sameSecret = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Robots-Tag', 'noindex');
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!config.adminPassword || !token || !sameSecret(token, config.adminPassword)) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }
  next();
});

const summarize = (paid) => {
  const sizes = Object.fromEntries(TSHIRT_SIZES.map((s) => [s, 0]));
  const byProduct = {};
  let cd = 0;
  let revenue = 0;
  let toShip = 0;

  for (const order of paid) {
    revenue += order.total || 0;
    if (!order.fulfilled_at) toShip += 1;
    for (const item of order.items) {
      const product = getProduct(item.productId);
      byProduct[item.productId] = (byProduct[item.productId] || 0) + item.qty;
      if (product?.contains.cd) cd += product.contains.cd * item.qty;
      if (product?.contains.tshirt && item.size) sizes[item.size] = (sizes[item.size] || 0) + item.qty;
    }
  }

  return {
    orders: paid.length,
    toShip,
    revenue,
    cd,
    tshirts: Object.values(sizes).reduce((a, b) => a + b, 0),
    tshirtSizes: sizes,
    byProduct,
  };
};

router.get('/orders', (req, res) => {
  const all = req.query.all === '1';
  const paid = orders.listPaid();
  res.json({
    summary: summarize(paid),
    testMode: config.stripe.testMode,
    orders: all ? orders.listAll() : [...paid.slice().reverse(), ...orders.listRefunded()],
  });
});

// Marks shipped (optionally with a tracking number/URL) and emails the buyer.
router.post('/orders/:number/fulfilled', express.json(), async (req, res) => {
  const fulfilled = req.body?.fulfilled !== false;
  const tracking = typeof req.body?.tracking === 'string' ? req.body.tracking.trim().slice(0, 300) : '';
  const before = orders.byNumber(req.params.number);
  if (!orders.setFulfilled(req.params.number, fulfilled, tracking || null)) {
    return res.status(404).json({ error: 'Commande introuvable ou non payée' });
  }
  const order = orders.byNumber(req.params.number);
  let emailSent = false;
  if (fulfilled && !before.fulfilled_at && req.body?.notify !== false) {
    try {
      emailSent = await notifyShipped(order);
    } catch (err) {
      console.error(`Email d'expédition ${order.number} échoué :`, err);
    }
  }
  res.json({ ...order, emailSent });
});

router.post('/orders/:number/note', express.json(), (req, res) => {
  const note = typeof req.body?.note === 'string' ? req.body.note.slice(0, 1000) : '';
  if (!orders.setNote(req.params.number, note)) return res.status(404).json({ error: 'Commande introuvable' });
  res.json(orders.byNumber(req.params.number));
});

// Semicolon-separated + BOM so it opens cleanly in French Excel / Numbers.
router.get('/orders.csv', (req, res) => {
  const cell = (v) => {
    let s = v == null ? '' : String(v);
    // Neutralise spreadsheet formulas coming from customer-typed fields.
    // (+33… phone numbers are left alone.)
    if (/^[=@\t\r]/.test(s) || /^[+-](?![\d\s]+$)/.test(s)) s = `'${s}`;
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = [
    'Commande', 'Payée le', 'Nom', 'Email', 'Téléphone', 'Adresse', 'Complément',
    'Code postal', 'Ville', 'Pays', 'Articles', 'Nb CD', 'Nb T-shirts', 'Total (€)', 'Expédiée le', 'Suivi',
    'Note', 'Alertes',
  ];

  const rows = orders.listPaid().map((o) => {
    const a = o.shipping_address?.address || {};
    return [
      o.number,
      o.paid_at && new Date(o.paid_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
      o.shipping_address?.name || o.customer_name,
      o.email,
      o.phone,
      a.line1,
      a.line2,
      a.postal_code,
      a.city,
      a.country,
      o.items.map((i) => `${i.qty}x ${i.name}${i.size ? ` (${i.size})` : ''}`).join(' + '),
      o.cd_count,
      o.tshirt_count,
      ((o.total || 0) / 100).toFixed(2).replace('.', ','),
      o.fulfilled_at && new Date(o.fulfilled_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
      o.tracking,
      o.note,
      o.flags.join(' | '),
    ];
  });

  const csv = '﻿' + [header, ...rows].map((r) => r.map(cell).join(';')).join('\r\n');
  const stamp = new Date().toISOString().slice(0, 10);
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="commandes-lycee-musical-${stamp}.csv"`);
  res.send(csv);
});

module.exports = router;
