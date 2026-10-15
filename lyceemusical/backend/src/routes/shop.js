const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const stripe = require('../stripe');
const business = require('../business');
const { PRODUCTS } = require('../catalog');
const { SITE, reconcileSession } = require('../fulfillment');
const { orders } = require('../db');
const { HttpError, normalizeEmail, normalizeCart, assertWithinLimits, preorderPhase } = require('../cart');

const router = express.Router();

// Stripe needs expires_at >= 30 min ahead; a few extra minutes absorbs clock drift.
const CHECKOUT_TTL_MS = 35 * 60 * 1000;

const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessaie dans quelques minutes.' },
});

router.get('/shop', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    now: new Date().toISOString(),
    phase: preorderPhase(),
    preorder: {
      opensAt: config.preorder.opensAt.toISOString(),
      closesAt: config.preorder.closesAt.toISOString(),
      shippingEstimate: config.preorder.shippingEstimate,
    },
    limits: config.limits,
    shipping: config.shipping,
    products: PRODUCTS,
    testMode: config.stripe.testMode,
    business,
  });
});

router.post('/checkout', checkoutLimiter, async (req, res, next) => {
  let order;
  try {
    const phase = preorderPhase();
    if (phase === 'upcoming') throw new HttpError(403, 'Les précommandes ne sont pas encore ouvertes.', 'not_open');
    if (phase === 'closed') throw new HttpError(403, 'Les précommandes sont terminées.', 'closed');

    const { email: rawEmail, items: rawItems, acceptTerms } = req.body || {};
    if (acceptTerms !== true) {
      throw new HttpError(400, 'Merci d’accepter les conditions générales de vente.', 'terms');
    }
    const email = normalizeEmail(rawEmail);
    const { items, counts, subtotal } = normalizeCart(rawItems);

    // Synchronous from here to createPending: no other request can slip a
    // competing order in between the limit check and the insert.
    assertWithinLimits(counts, orders.usageForEmail(email));
    const expiresAt = new Date(Date.now() + CHECKOUT_TTL_MS);
    order = orders.createPending({
      email,
      items,
      counts,
      subtotal,
      shipping: config.shipping.feeCents,
      expiresAt,
    });

    const fee = config.shipping.feeCents;
    const taxRates = config.stripe.taxRateId ? [config.stripe.taxRateId] : undefined;
    const lineItems = items.map((i) => ({
      quantity: i.qty,
      tax_rates: taxRates,
      price_data: {
        currency: 'eur',
        unit_amount: i.unitPrice,
        product_data: { name: i.size ? `${i.name} — Taille ${i.size}` : i.name },
      },
    }));
    // Shipping as a regular line so the (inclusive) VAT rate applies to it too.
    if (fee > 0) {
      lineItems.push({
        quantity: 1,
        tax_rates: taxRates,
        price_data: { currency: 'eur', unit_amount: fee, product_data: { name: 'Livraison à domicile' } },
      });
    }

    const metadata = { site: SITE, order_number: order.number };
    const footer = [
      [business.legalName, business.capital && `capital ${business.capital}`].filter(Boolean).join(' — '),
      [business.address, business.rcs, business.siret && `SIRET ${business.siret}`].filter(Boolean).join(' — '),
      business.vatRegime === 'franchise'
        ? 'TVA non applicable, art. 293 B du CGI.'
        : business.vatNumber && `TVA intracommunautaire : ${business.vatNumber}`,
      'Précommande — vente à distance, droit de rétractation de 14 jours à réception (voir CGV).',
    ]
      .filter(Boolean)
      .join('\n');

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        locale: 'fr',
        customer_email: email,
        client_reference_id: order.number,
        line_items: lineItems,
        shipping_address_collection: { allowed_countries: config.shipping.countries },
        phone_number_collection: { enabled: true },
        billing_address_collection: 'auto',
        // The RBS Stripe account is shared: brand this page as Lycée Musical.
        branding_settings: {
          display_name: 'Lycée Musical — Luvbfk',
          font_family: 'inconsolata',
          border_style: 'rectangular',
          button_color: '#ff1111',
          background_color: '#ffffff',
          ...(config.stripe.logoUrl ? { logo: { type: 'url', url: config.stripe.logoUrl } } : {}),
        },
        custom_text: {
          submit: {
            message: `Précommande${config.preorder.shippingEstimate ? ` — ${config.preorder.shippingEstimate}` : ''}. Vendu par ${business.legalName}.`,
          },
        },
        invoice_creation: config.stripe.invoices
          ? {
              enabled: true,
              invoice_data: {
                description: `Précommande ${order.number} — EP « Lycée Musical » (Luvbfk)`,
                footer: footer.slice(0, 5000),
                metadata,
              },
            }
          : undefined,
        payment_intent_data: {
          description: `Précommande ${order.number} — Lycée Musical`,
          statement_descriptor_suffix: config.stripe.statementSuffix,
          metadata,
        },
        metadata,
        expires_at: Math.floor(expiresAt.getTime() / 1000),
        success_url: `${config.publicUrl}/commande/confirmee?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.publicUrl}/boutique?panier=1`,
      },
      // created_at keeps keys unique even if a dev database is reset.
      { idempotencyKey: `checkout-${order.number}-${order.created_at}` }
    );

    orders.attachSession(order.id, session.id);
    res.json({ url: session.url });
  } catch (err) {
    // Free the quota held by an order that never reached Stripe.
    if (order) orders.discard(order.id);
    next(err);
  }
});

// Public order status for the confirmation page. The Checkout session id is
// an unguessable secret handed only to the buyer — still, no address here.
// If the webhook is late, ask Stripe directly (at most every 5 s per order)
// so the buyer's confirmation page never hangs.
const lastStripeCheck = new Map();

router.get('/orders/:sessionId', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const sessionId = String(req.params.sessionId).slice(0, 200);
  let order = orders.bySession(sessionId);
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });

  if (order.status === 'pending' && Date.now() - (lastStripeCheck.get(sessionId) || 0) > 5000) {
    lastStripeCheck.set(sessionId, Date.now());
    if (lastStripeCheck.size > 5000) lastStripeCheck.clear();
    try {
      order = (await reconcileSession(sessionId)) || orders.bySession(sessionId);
    } catch (err) {
      console.error('Vérification Stripe impossible :', err.message);
    }
  }

  res.json({
    number: order.number,
    status: order.status,
    items: order.items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
  });
});

module.exports = router;
