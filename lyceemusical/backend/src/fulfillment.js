// What happens when Stripe says an order is paid / refunded / disputed.
// Shared by the webhook and the reconciliation job, so an order is handled
// identically whichever of the two sees it first.
const config = require('./config');
const stripe = require('./stripe');
const { orders } = require('./db');
const { notifyNewOrder, notifyAlert } = require('./notify');

const SITE = 'lyceemusical';

// Our sessions carry metadata.site — anything else on the (possibly shared)
// Stripe account belongs to another site and is ignored.
const isOurs = (obj) => obj?.metadata?.site === SITE;

// Marks the order paid and returns it, or null if it was already handled.
// Pure DB work, synchronous: safe to call before answering Stripe.
function markSessionPaid(session) {
  if (session.payment_status !== 'paid') return null;
  const shipping = session.collected_information?.shipping_details || session.shipping_details || null;
  const paid = orders.markPaid(session.id, {
    total: session.amount_total,
    name: shipping?.name || session.customer_details?.name,
    phone: session.customer_details?.phone,
    address: shipping,
    paymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
    invoiceId: typeof session.invoice === 'string' ? session.invoice : session.invoice?.id,
  });
  if (!paid) return null;

  // Belt and braces: the amounts are computed server-side, but any drift
  // between what we expected and what Stripe charged gets surfaced.
  const expected = paid.subtotal + paid.shipping;
  if (session.amount_total !== expected) {
    orders.addFlag(paid.id, `MONTANT INATTENDU : ${session.amount_total / 100} € au lieu de ${expected / 100} €`);
  }
  if (session.livemode === config.stripe.testMode) {
    orders.addFlag(paid.id, session.livemode ? 'PAIEMENT LIVE AVEC CLÉ TEST ?' : 'PAIEMENT DE TEST');
  }
  const usage = orders.usageForEmail(paid.email); // includes this order
  if (usage.cd > config.limits.cd || usage.tshirt > config.limits.tshirt) {
    orders.addFlag(paid.id, `LIMITE DÉPASSÉE pour ${paid.email} (${usage.cd} CD, ${usage.tshirt} t-shirts) — rembourser l'excédent ?`);
  }

  console.log(`✓ Commande payée ${paid.number} — ${paid.email} — ${paid.total / 100} €`);
  return orders.byNumber(paid.number);
}

// Slow, network-bound part — run after Stripe got its 200.
async function sendOrderNotifications(order) {
  try {
    if (await notifyNewOrder(order)) orders.markNotified(order.id);
  } catch (err) {
    console.error(`Notification échouée pour ${order.number}:`, err);
  }
}

function handleRefund(charge) {
  const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
  const order = pi && orders.byPaymentIntent(pi);
  if (!order) return null;
  if (charge.refunded) {
    const refunded = orders.markRefunded(order.id);
    if (refunded) console.log(`↺ Commande remboursée ${order.number}`);
    return refunded;
  }
  orders.addFlag(order.id, `REMBOURSEMENT PARTIEL : ${charge.amount_refunded / 100} €`);
  return null;
}

async function handleDispute(dispute) {
  const pi = typeof dispute.payment_intent === 'string' ? dispute.payment_intent : dispute.payment_intent?.id;
  const order = pi && orders.byPaymentIntent(pi);
  if (!order) return; // another site's payment
  orders.addFlag(order.id, `LITIGE BANCAIRE (${dispute.reason}) — répondre dans le dashboard Stripe`);
  await notifyAlert(
    `⚠ Litige bancaire sur ${order.number}`,
    [
      `Le client ${order.email} a contesté le paiement de ${order.number} (${dispute.amount / 100} €).`,
      `Motif : ${dispute.reason}.`,
      '',
      'À faire rapidement : Stripe → Paiements → Litiges → fournir les preuves',
      '(email de confirmation, preuve d’expédition / numéro de suivi).',
      `https://dashboard.stripe.com/${config.stripe.testMode ? 'test/' : ''}disputes/${dispute.id}`,
    ].join('\n')
  );
}

// Asks Stripe directly — used when a webhook may have been missed.
async function reconcileSession(sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.status === 'expired') {
    orders.markExpired(sessionId);
    return null;
  }
  const paid = markSessionPaid(session);
  if (paid) sendOrderNotifications(paid); // never blocks the caller; errors are logged
  return paid;
}

let running = false;
async function reconcilePending() {
  if (running) return;
  running = true;
  try {
    for (const order of orders.pendingToReconcile()) {
      try {
        const paid = await reconcileSession(order.session_id);
        if (paid) console.log(`↻ Rattrapage : ${paid.number} confirmé sans webhook`);
      } catch (err) {
        console.error(`Rattrapage ${order.number} impossible :`, err.message);
      }
    }
  } finally {
    running = false;
  }
}

module.exports = {
  SITE,
  isOurs,
  markSessionPaid,
  sendOrderNotifications,
  handleRefund,
  handleDispute,
  reconcileSession,
  reconcilePending,
};
