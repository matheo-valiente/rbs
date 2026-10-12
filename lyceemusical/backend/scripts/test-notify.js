// Envoie une fausse commande aux canaux configurés pour vérifier que les
// 2 responsables reçoivent bien les notifications.
//   npm run test-notify            (équipe + client fictif = 1er NOTIFY_EMAILS)
const config = require('../src/config');
const { notifyNewOrder } = require('../src/notify');

const order = {
  id: 0,
  number: 'LM-TEST',
  email: config.notify.emails[0] || 'test@exemple.com',
  items: [
    { productId: 'pack', name: 'PACK CD + T-SHIRT', size: 'M', qty: 1, unitPrice: 2500 },
    { productId: 'cd', name: 'CD — LYCÉE MUSICAL', size: null, qty: 2, unitPrice: 1000 },
  ],
  subtotal: 4500,
  shipping: config.shipping.feeCents,
  total: 4500 + config.shipping.feeCents,
  customer_name: 'Client Test',
  phone: '+33600000000',
  payment_intent: null,
  shipping_address: {
    name: 'Client Test',
    address: { line1: '1 rue de Test', line2: null, postal_code: '75001', city: 'Paris', country: 'FR' },
  },
};

notifyNewOrder(order)
  .then((ok) => {
    console.log(ok ? '✓ Notification équipe envoyée' : '✗ Aucun canal équipe n’a fonctionné (voir logs)');
    process.exit(ok ? 0 : 1);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
