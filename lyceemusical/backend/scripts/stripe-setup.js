// Configure Stripe automatiquement (à relancer sans risque) :
//  - vérifie le compte (paiements activés ?)
//  - crée le taux de TVA « inclus » si VAT_RATE > 0
//  - crée / met à jour le webhook https://<domaine>/api/webhook
// Affiche les lignes à copier dans backend/.env.
//
//   npm run stripe:setup
const config = require('../src/config');
const stripe = require('../src/stripe');
const business = require('../src/business');

const EVENTS = [
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
  'charge.refunded',
  'charge.dispute.created',
];

(async () => {
  if (!config.stripe.secretKey || config.stripe.secretKey.endsWith('xxx')) {
    console.error('✗ STRIPE_SECRET_KEY manquante dans backend/.env');
    process.exit(1);
  }
  const mode = config.stripe.testMode ? 'TEST' : 'LIVE';
  console.log(`\n=== Stripe — mode ${mode} ===\n`);
  const envLines = [];

  const account = await stripe.accounts.retrieve();
  const name = account.business_profile?.name || account.settings?.dashboard?.display_name || account.id;
  console.log(`Compte : ${name} (${account.country})`);
  console.log(`  Paiements activés : ${account.charges_enabled ? '✓' : '✗ — terminer l’activation dans le dashboard'}`);
  console.log(`  Virements activés : ${account.payouts_enabled ? '✓' : '✗ — IBAN / vérification manquants'}`);
  console.log(`  Libellé bancaire : ${account.settings?.payments?.statement_descriptor || '(non défini)'} + « ${config.stripe.statementSuffix} »`);

  // --- TVA
  if (business.vatRegime === 'normal' && config.vatRate > 0) {
    let rate = null;
    if (config.stripe.taxRateId) {
      rate = await stripe.taxRates.retrieve(config.stripe.taxRateId).catch(() => null);
    }
    if (!rate) {
      const existing = await stripe.taxRates.list({ active: true, limit: 100 });
      rate = existing.data.find(
        (r) => r.metadata?.site === 'lyceemusical' && r.inclusive && Number(r.percentage) === config.vatRate
      );
    }
    if (!rate) {
      rate = await stripe.taxRates.create({
        display_name: 'TVA',
        description: `TVA France ${config.vatRate} % (prix TTC)`,
        percentage: config.vatRate,
        inclusive: true,
        country: 'FR',
        jurisdiction: 'FR',
        metadata: { site: 'lyceemusical' },
      });
      console.log(`\n✓ Taux de TVA créé : ${rate.id} (${config.vatRate} % inclus)`);
    } else {
      console.log(`\n✓ Taux de TVA : ${rate.id} (${rate.percentage} % inclus)`);
    }
    envLines.push(`STRIPE_TAX_RATE_ID=${rate.id}`);
  } else {
    console.log(`\nTVA : ${business.vatRegime === 'franchise' ? 'franchise en base (art. 293 B)' : 'VAT_RATE=0 → pas de ligne TVA'}`);
  }

  // --- Webhook
  if (!config.publicUrl.startsWith('https://')) {
    console.log('\nWebhook : PUBLIC_URL n’est pas en https → en local, utiliser :');
    console.log('  stripe listen --forward-to localhost:3001/api/webhook');
  } else {
    const url = `${config.publicUrl}/api/webhook`;
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    const found = endpoints.data.find((e) => e.url === url);
    if (found) {
      const events = [...new Set([...found.enabled_events, ...EVENTS])];
      await stripe.webhookEndpoints.update(found.id, { enabled_events: events, disabled: false });
      console.log(`\n✓ Webhook existant mis à jour : ${url}`);
      console.log('  (le secret n’est visible qu’à la création : dashboard → Webhooks → ce endpoint → « Signing secret »)');
    } else {
      const created = await stripe.webhookEndpoints.create({
        url,
        enabled_events: EVENTS,
        description: 'Lycée Musical — précommandes',
      });
      console.log(`\n✓ Webhook créé : ${url}`);
      envLines.push(`STRIPE_WEBHOOK_SECRET=${created.secret}`);
    }
  }

  if (envLines.length) {
    console.log('\n--- À mettre dans backend/.env (puis redémarrer) ---');
    envLines.forEach((l) => console.log(l));
  }
  console.log('\nEnsuite : npm run check\n');
})().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
