const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const env = process.env;
const isProd = env.NODE_ENV === 'production';

const list = (v) =>
  String(v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const int = (v, fallback) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

const date = (v, fallback) => {
  const d = new Date(v || fallback);
  if (Number.isNaN(d.getTime())) throw new Error(`Date invalide : ${v}`);
  return d;
};

const config = {
  isProd,
  port: int(env.PORT, 3001),
  publicUrl: (env.PUBLIC_URL || 'http://localhost:5173').replace(/\/$/, ''),

  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    testMode: !String(env.STRIPE_SECRET_KEY || '').startsWith('sk_live_'),
    // Inclusive VAT rate created by `npm run stripe:setup` (empty = no VAT line).
    taxRateId: env.STRIPE_TAX_RATE_ID || '',
    // One numbered PDF invoice per order, emailed by Stripe and listed in the dashboard.
    invoices: env.STRIPE_INVOICES !== 'false',
    // Bank statement shows "<compte>* LYCEE MUSICAL" — fewer "unknown charge" disputes.
    statementSuffix: (env.STATEMENT_DESCRIPTOR_SUFFIX || 'LYCEE MUSICAL').slice(0, 22),
    logoUrl: env.CHECKOUT_LOGO_URL || '',
  },

  preorder: {
    opensAt: date(env.PREORDER_OPENS_AT, '2026-10-15T00:00:00+02:00'),
    closesAt: date(env.PREORDER_CLOSES_AT, '2026-10-28T23:59:59+01:00'),
    shippingEstimate: env.SHIPPING_ESTIMATE || '',
    // Achats en pause (site visible, panier et paiement bloqués) : ORDERS_PAUSED=true
    paused: env.ORDERS_PAUSED === 'true',
    pausedMessage: env.ORDERS_PAUSED_MESSAGE || 'Achats possibles dès demain',
  },

  limits: {
    cd: int(env.MAX_CD_PER_PERSON, 3),
    tshirt: int(env.MAX_TSHIRT_PER_PERSON, 3),
  },

  shipping: {
    feeCents: int(env.SHIPPING_FEE_CENTS, 0),
    countries: list(env.SHIPPING_COUNTRIES || 'FR'),
  },

  notify: {
    emails: list(env.NOTIFY_EMAILS),
    smtp: {
      host: env.SMTP_HOST,
      port: int(env.SMTP_PORT, 587),
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    from: env.MAIL_FROM || 'Lycée Musical <commandes@lyceemusical.com>',
    replyTo: env.MAIL_REPLY_TO || undefined,
    sendCustomerEmail: env.SEND_CUSTOMER_EMAIL !== 'false',
    telegram: {
      token: env.TELEGRAM_BOT_TOKEN,
      chatId: env.TELEGRAM_CHAT_ID,
    },
  },

  vatRate: Number(env.VAT_RATE || 0),
  adminPassword: env.ADMIN_PASSWORD,
  dbPath: path.resolve(__dirname, '..', env.DB_PATH || '../data/shop.db'),
};

// Refuse to boot a production server with a half-configured shop —
// better a crash at deploy time than orders silently stuck in "pending".
if (isProd) {
  const missing = [];
  if (!config.stripe.secretKey || config.stripe.secretKey.endsWith('xxx')) missing.push('STRIPE_SECRET_KEY');
  if (!config.stripe.webhookSecret || config.stripe.webhookSecret.endsWith('xxx')) missing.push('STRIPE_WEBHOOK_SECRET');
  if (!config.adminPassword || config.adminPassword === 'change-moi' || config.adminPassword.length < 12)
    missing.push('ADMIN_PASSWORD (12 caractères min.)');
  if (!config.publicUrl.startsWith('https://')) missing.push('PUBLIC_URL (https://...)');
  if (missing.length) {
    console.error(`Configuration manquante : ${missing.join(', ')}`);
    process.exit(1);
  }
  if (config.stripe.testMode) {
    console.warn('⚠ STRIPE EN MODE TEST — aucun vrai paiement ne sera encaissé (bandeau « MODE TEST » affiché sur le site).');
  }
  if (!config.notify.emails.length && !config.notify.telegram.token) {
    console.warn('⚠ Aucune notification configurée (NOTIFY_EMAILS / TELEGRAM_*) — personne ne sera prévenu des commandes.');
  }
}

if (config.preorder.closesAt <= config.preorder.opensAt) {
  throw new Error('PREORDER_CLOSES_AT doit être après PREORDER_OPENS_AT');
}

module.exports = config;
