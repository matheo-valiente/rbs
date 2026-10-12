const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { HttpError } = require('./cart');

const { db } = require('./db'); // open + migrate the database before accepting traffic
const { reconcilePending } = require('./fulfillment');

const app = express();
app.disable('x-powered-by');

// Behind Caddy/nginx — needed for real client IPs in the rate limiter.
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        mediaSrc: ["'self'"],
        connectSrc: ["'self'"],
        // Checkout is a full-page redirect to Stripe — allow that navigation target.
        formAction: ["'self'", 'https://checkout.stripe.com'],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Webhook needs the raw body for signature checks — mount BEFORE express.json().
app.use('/api/webhook', require('./routes/webhook'));

app.use(express.json({ limit: '20kb' }));
app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false })
);

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/shop'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Production: the built frontend is served by this same process.
const dist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(dist)) {
  app.use(
    express.static(dist, {
      index: false,
      setHeaders(res, file) {
        // Vite fingerprints /assets/* — safe to cache forever.
        if (file.includes(`${path.sep}assets${path.sep}`)) {
          res.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          res.set('Cache-Control', 'public, max-age=3600');
        }
      },
    })
  );
  // A missing photo must 404 (the front then shows its drawn placeholder),
  // not fall through to index.html.
  app.use('/media', (req, res) => res.status(404).end());

  // index.html carries absolute URLs (Open Graph) — fill in the real domain.
  const indexHtml = fs
    .readFileSync(path.join(dist, 'index.html'), 'utf-8')
    .replaceAll('__PUBLIC_URL__', config.publicUrl);
  app.get('*', (req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.type('html').send(indexHtml);
  });
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, code: err.code });
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Requête invalide' });
  console.error(err);
  res.status(500).json({ error: 'Paiement indisponible pour le moment. Réessaie dans un instant.' });
});

const server = app.listen(config.port, () => {
  console.log(`Lycée Musical — serveur sur http://localhost:${config.port}`);
  console.log(
    `Précommandes : ${config.preorder.opensAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })} → ` +
      `${config.preorder.closesAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`
  );
});

// Safety net: if a webhook was lost (server restarting, network blip…), ask
// Stripe directly about checkouts still pending after 2 minutes.
const reconcileTimer = setInterval(() => reconcilePending().catch(console.error), 5 * 60 * 1000);
setTimeout(() => reconcilePending().catch(console.error), 10 * 1000);

// Docker sends SIGTERM on redeploy: finish in-flight requests, close the DB cleanly.
const shutdown = (signal) => {
  console.log(`${signal} reçu — arrêt propre…`);
  clearInterval(reconcileTimer);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 10000).unref();
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
