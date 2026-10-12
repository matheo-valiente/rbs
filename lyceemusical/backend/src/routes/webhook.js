// Stripe webhook — the normal path for an order to become "paid". The
// redirect to /commande/confirmee proves nothing (anyone can open that URL);
// the reconciliation job (fulfillment.reconcilePending) covers missed events.
const express = require('express');
const config = require('../config');
const stripe = require('../stripe');
const { orders } = require('../db');
const {
  isOurs,
  markSessionPaid,
  sendOrderNotifications,
  handleRefund,
  handleDispute,
} = require('../fulfillment');

const router = express.Router();

router.post('/', express.raw({ type: 'application/json', limit: '1mb' }), (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], config.stripe.webhookSecret);
  } catch (err) {
    console.error('Signature webhook invalide :', err.message);
    return res.status(400).send('Invalid signature');
  }

  const obj = event.data.object;
  let paidOrder = null;
  let dispute = null;
  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        // Cards are 'paid' at completion; delayed methods arrive via async_payment_succeeded.
        if (isOurs(obj)) paidOrder = markSessionPaid(obj);
        break;
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed':
        if (isOurs(obj)) orders.markExpired(obj.id);
        break;
      case 'charge.refunded':
        handleRefund(obj);
        break;
      case 'charge.dispute.created':
        dispute = obj;
        break;
      default:
        break;
    }
  } catch (err) {
    // Non-2xx makes Stripe retry later — what we want if the DB hiccuped.
    console.error(`Webhook ${event.type} en échec :`, err);
    return res.status(500).send('Webhook handler failed');
  }

  res.json({ received: true });

  // After the 200: a slow SMTP server must not make Stripe time out and retry.
  if (paidOrder) sendOrderNotifications(paidOrder);
  if (dispute) handleDispute(dispute).catch((err) => console.error('Alerte litige échouée :', err));
});

module.exports = router;
