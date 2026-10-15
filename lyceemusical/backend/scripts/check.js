// Vérification complète avant ouverture des précommandes.
//   npm run check            (en local)
//   docker compose exec app npm run check   (sur le serveur)
// ✓ = OK   ⚠ = à regarder   ✗ = bloquant
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const config = require('../src/config');
const business = require('../src/business');
const { PRODUCTS } = require('../src/catalog');
const { verifySmtp } = require('../src/notify');

let failures = 0;
let warnings = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const warn = (m) => (warnings++, console.log(`  ⚠ ${m}`));
const fail = (m) => (failures++, console.log(`  ✗ ${m}`));
const section = (t) => console.log(`\n${t}`);
const paris = (d) => d.toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'full', timeStyle: 'short' });

const publicDir = [path.join(__dirname, '../../frontend/public'), path.join(__dirname, '../../frontend/dist')].find(
  (d) => fs.existsSync(d),
);
const mediaExists = (p) => publicDir && fs.existsSync(path.join(publicDir, p));

(async () => {
  console.log('\n=== Lycée Musical — vérification ===');

  section('Site');
  config.publicUrl.startsWith('https://')
    ? ok(`URL publique : ${config.publicUrl}`)
    : warn(`URL publique : ${config.publicUrl} (pas https — normal en local)`);
  if (config.publicUrl.startsWith('https://')) {
    const host = new URL(config.publicUrl).hostname;
    try {
      const { address } = await dns.lookup(host);
      ok(`DNS ${host} → ${address}`);
    } catch {
      fail(`DNS : ${host} ne pointe nulle part (zone DNS OVH)`);
    }
  }
  !config.adminPassword || config.adminPassword === 'change-moi' || config.adminPassword.length < 12
    ? fail('ADMIN_PASSWORD trop faible ou absent (openssl rand -base64 24)')
    : ok('Mot de passe admin défini');

  section('Précommande');
  ok(`Ouverture : ${paris(config.preorder.opensAt)}`);
  ok(`Fermeture : ${paris(config.preorder.closesAt)}`);
  const days = (config.preorder.closesAt - config.preorder.opensAt) / 86400000;
  days > 15 ? warn(`Durée : ${days.toFixed(1)} jours (> 2 semaines)`) : ok(`Durée : ${days.toFixed(1)} jours`);
  ok(`Limites : ${config.limits.cd} CD / ${config.limits.tshirt} t-shirts par personne`);
  ok(`Livraison : ${config.shipping.feeCents / 100} € — pays ${config.shipping.countries.join(', ')}`);
  config.preorder.shippingEstimate && !config.preorder.shippingEstimate.includes('[')
    ? ok(`Délai affiché : ${config.preorder.shippingEstimate}`)
    : warn('SHIPPING_ESTIMATE à compléter (date d’expédition — obligatoire légalement)');

  section('Stripe');
  if (!config.stripe.secretKey || config.stripe.secretKey.endsWith('xxx')) {
    fail('STRIPE_SECRET_KEY manquante');
  } else {
    const stripe = require('../src/stripe');
    config.stripe.testMode ? warn('Mode TEST (sk_test_) — passer en sk_live_ pour encaisser') : ok('Mode LIVE');
    try {
      const account = await stripe.accounts.retrieve();
      ok(`Compte : ${account.business_profile?.name || account.id}`);
      account.charges_enabled ? ok('Paiements activés') : fail('Paiements NON activés — finir l’activation du compte');
      account.payouts_enabled ? ok('Virements activés') : warn('Virements non activés (IBAN / vérification)');
    } catch (err) {
      fail(`Clé Stripe refusée : ${err.message}`);
    }

    if (business.vatRegime === 'normal') {
      if (!config.stripe.taxRateId) fail('STRIPE_TAX_RATE_ID manquant (npm run stripe:setup)');
      else {
        const rate = await stripe.taxRates.retrieve(config.stripe.taxRateId).catch(() => null);
        rate?.active && rate.inclusive
          ? ok(`TVA ${rate.percentage} % incluse (${rate.id})`)
          : fail('STRIPE_TAX_RATE_ID invalide, inactif ou non « inclus »');
      }
    } else ok('Franchise de TVA (mention art. 293 B sur les factures)');
    ok(`Factures Stripe : ${config.stripe.invoices ? 'activées' : 'désactivées'}`);

    if (!config.stripe.webhookSecret || config.stripe.webhookSecret.endsWith('xxx')) {
      fail('STRIPE_WEBHOOK_SECRET manquant');
    } else if (config.publicUrl.startsWith('https://')) {
      const url = `${config.publicUrl}/api/webhook`;
      const list = await stripe.webhookEndpoints.list({ limit: 100 }).catch(() => ({ data: [] }));
      const ep = list.data.find((e) => e.url === url);
      if (!ep) fail(`Aucun webhook Stripe vers ${url} (npm run stripe:setup)`);
      else if (ep.status !== 'enabled') fail(`Webhook ${url} désactivé`);
      else {
        const needed = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'charge.refunded'];
        const missing = needed.filter((e) => !ep.enabled_events.includes(e) && !ep.enabled_events.includes('*'));
        missing.length ? fail(`Webhook : événements manquants ${missing.join(', ')}`) : ok(`Webhook actif : ${url}`);
      }
    } else ok('Webhook : secret présent (local → stripe listen)');
  }

  section('Notifications');
  config.notify.emails.length
    ? ok(`Responsables : ${config.notify.emails.join(', ')}`)
    : fail('NOTIFY_EMAILS vide — personne ne sera prévenu des commandes');
  try {
    (await verifySmtp())
      ? ok(`SMTP ${config.notify.smtp.host} : connexion OK`)
      : fail('SMTP non configuré (SMTP_HOST / USER / PASS)');
  } catch (err) {
    fail(`SMTP refusé : ${err.message}`);
  }
  config.notify.telegram.token ? ok('Telegram configuré') : ok('Telegram : non utilisé (optionnel)');
  console.log('    → test réel : npm run test-notify');

  section('Infos légales (backend/src/business.js)');
  const placeholders = Object.entries(business)
    .filter(([, v]) => JSON.stringify(v).includes('['))
    .map(([k]) => k);
  placeholders.length ? fail(`À compléter : ${placeholders.join(', ')}`) : ok('Complètes');

  section('Contenus');
  if (!publicDir) warn('Dossier frontend introuvable — contenus non vérifiés');
  else {
    const hero = path.join(publicDir, 'media/video/hero.mp4');
    if (!fs.existsSync(hero)) fail('Vidéo d’accueil manquante (media/video/hero.mp4)');
    else {
      const mb = fs.statSync(hero).size / 1e6;
      mb > 20
        ? warn(`Vidéo d’accueil lourde : ${mb.toFixed(1)} Mo (viser < 15 Mo)`)
        : ok(`Vidéo d’accueil : ${mb.toFixed(1)} Mo`);
    }
    for (const [file, label] of [
      ['media/photos/luvbfk.jpg', 'Portrait Luvbfk'],
      ['media/photos/cover-front.jpg', 'Pochette (recto)'],
      ['media/photos/cover-back.jpg', 'Pochette (verso)'],
      ['media/og.jpg', 'Image de partage réseaux (og.jpg)'],
    ]) {
      mediaExists(file) ? ok(label) : warn(`${label} manquante (${file})`);
    }
    for (const p of PRODUCTS) {
      p.image && mediaExists(p.image.replace(/^\//, ''))
        ? ok(`Photo ${p.shortName}`)
        : warn(`Photo ${p.shortName} manquante (${p.image}) → dessin affiché`);
    }
    // Sources du frontend absentes de l'image Docker (seul dist/ y est) : on saute ce contrôle sur le serveur.
    const frontPath = path.join(__dirname, '../../frontend/src/config.js');
    const front = fs.existsSync(frontPath) ? fs.readFileSync(frontPath, 'utf-8') : null;
    if (front) {
      const todo = (front.match(/\[[^\]]*À (COMPLÉTER|VÉRIFIER)[^\]]*\]/g) || []).length;
      todo ? warn(`frontend/src/config.js : ${todo} élément(s) [À COMPLÉTER]`) : ok('Textes du site complétés');
      const emptyLinks = (front.match(/^\s+(\w+): '',?/gm) || []).map((l) => l.trim().split(':')[0]);
      emptyLinks.length
        ? warn(`Liens vides (affichés « BIENTÔT ») : ${emptyLinks.join(', ')}`)
        : ok('Tous les liens renseignés');
    }
  }

  console.log(
    `\n${failures ? `✗ ${failures} problème(s) bloquant(s)` : '✓ Rien de bloquant'}${warnings ? ` — ${warnings} point(s) à regarder` : ''}\n`,
  );
  process.exit(failures ? 1 : 0);
})();
