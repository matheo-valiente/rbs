const Stripe = require('stripe');
const config = require('./config');

module.exports = new Stripe(config.stripe.secretKey || 'sk_test_missing', {
  maxNetworkRetries: 2,
  timeout: 15000,
});
