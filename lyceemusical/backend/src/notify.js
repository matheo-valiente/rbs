// Order notifications: email to the team (+ optional Telegram), and a
// confirmation email to the customer. Every channel is best-effort — a
// failing SMTP server must never make Stripe think the webhook failed.
const nodemailer = require('nodemailer');
const config = require('./config');
const business = require('./business');

const { notify } = config;

const transporter =
  notify.smtp.host && notify.smtp.user
    ? nodemailer.createTransport({
        host: notify.smtp.host,
        port: notify.smtp.port,
        secure: notify.smtp.port === 465,
        auth: { user: notify.smtp.user, pass: notify.smtp.pass },
      })
    : null;

const euros = (cents) =>
  (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const itemLine = (i) => `${i.qty} × ${i.name}${i.size ? ` — Taille ${i.size}` : ''}`;

const addressLines = (a) => {
  if (!a) return ['(adresse non fournie)'];
  const addr = a.address || {};
  return [
    a.name,
    addr.line1,
    addr.line2,
    [addr.postal_code, addr.city].filter(Boolean).join(' '),
    addr.state,
    addr.country,
  ].filter(Boolean);
};

const stripeLink = (order) =>
  order.payment_intent
    ? `https://dashboard.stripe.com/${config.stripe.secretKey?.startsWith('sk_test') ? 'test/' : ''}payments/${order.payment_intent}`
    : null;

// ---------------------------------------------------------------- team

const teamText = (order) =>
  [
    `NOUVELLE COMMANDE ${order.number} — ${euros(order.total)}`,
    ...(order.flags?.length ? ['', ...order.flags.map((f) => `⚠ ${f}`)] : []),
    '',
    ...order.items.map(itemLine),
    '',
    `Client : ${order.customer_name || '-'}`,
    `Email : ${order.email}`,
    `Téléphone : ${order.phone || '-'}`,
    '',
    'Livraison :',
    ...addressLines(order.shipping_address),
    '',
    stripeLink(order) ? `Stripe : ${stripeLink(order)}` : '',
    `Admin : ${config.publicUrl}/admin`,
  ].join('\n');

const teamHtml = (order) => `
  <div style="font-family:ui-monospace,Menlo,monospace;font-size:14px;color:#000;line-height:1.6">
    <p style="font-size:11px;letter-spacing:.2em;color:#ff1111;margin:0">NOUVELLE COMMANDE</p>
    <h1 style="font-size:22px;margin:4px 0 16px">${esc(order.number)} — ${esc(euros(order.total))}</h1>
    ${(order.flags || [])
      .map((f) => `<p style="background:#ff1111;color:#fff;padding:8px 12px;margin:0 0 8px;font-weight:700">⚠ ${esc(f)}</p>`)
      .join('')}
    <table style="border-collapse:collapse;margin-bottom:16px">
      ${order.items
        .map(
          (i) => `<tr>
            <td style="padding:4px 16px 4px 0;font-weight:700">${i.qty} ×</td>
            <td style="padding:4px 16px 4px 0">${esc(i.name)}</td>
            <td style="padding:4px 0">${i.size ? `Taille <b>${esc(i.size)}</b>` : ''}</td>
          </tr>`
        )
        .join('')}
    </table>
    <p style="margin:0 0 4px"><b>${esc(order.customer_name || '-')}</b></p>
    <p style="margin:0">${esc(order.email)} · ${esc(order.phone || '-')}</p>
    <p style="margin:16px 0 4px;font-size:11px;letter-spacing:.2em;opacity:.6">ADRESSE DE LIVRAISON</p>
    <p style="margin:0">${addressLines(order.shipping_address).map(esc).join('<br>')}</p>
    <p style="margin:24px 0 0">
      ${stripeLink(order) ? `<a href="${esc(stripeLink(order))}">Voir dans Stripe</a> · ` : ''}
      <a href="${esc(config.publicUrl)}/admin">Toutes les commandes</a>
    </p>
  </div>`;

// ------------------------------------------------------------ customer

const customerHtml = (order) => `
  <div style="font-family:ui-monospace,Menlo,monospace;font-size:14px;color:#000;line-height:1.7;max-width:560px">
    <p style="font-size:11px;letter-spacing:.25em;margin:0">LUVBFK — LYCÉE MUSICAL</p>
    <h1 style="font-size:24px;margin:8px 0 16px">Merci, ta précommande est confirmée.</h1>
    <p style="margin:0 0 16px">Commande <b>${esc(order.number)}</b></p>
    <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
      ${order.items
        .map(
          (i) => `<tr style="border-top:1px solid #e5e5e5">
            <td style="padding:8px 0">${esc(itemLine(i))}</td>
            <td style="padding:8px 0;text-align:right">${esc(euros(i.unitPrice * i.qty))}</td>
          </tr>`
        )
        .join('')}
      <tr style="border-top:1px solid #e5e5e5">
        <td style="padding:8px 0">Livraison</td>
        <td style="padding:8px 0;text-align:right">${order.shipping ? esc(euros(order.shipping)) : 'Offerte'}</td>
      </tr>
      <tr style="border-top:2px solid #000">
        <td style="padding:8px 0;font-weight:700">Total</td>
        <td style="padding:8px 0;text-align:right;font-weight:700">${esc(euros(order.total))}</td>
      </tr>
    </table>
    ${config.preorder.shippingEstimate ? `<p style="margin:0 0 16px">${esc(config.preorder.shippingEstimate)}.</p>` : ''}
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:.2em;opacity:.6">LIVRAISON À</p>
    <p style="margin:0 0 24px">${addressLines(order.shipping_address).map(esc).join('<br>')}</p>
    <p style="margin:0;font-size:12px;opacity:.6">
      Une question ? Réponds simplement à cet email en indiquant ton numéro de commande.
    </p>
    ${legalFooterHtml()}
  </div>`;

const legalFooter = () =>
  [business.legalName, business.address, business.siret && `SIRET ${business.siret}`].filter(Boolean).join(' — ');

const legalFooterHtml = () =>
  `<p style="margin:24px 0 0;padding-top:12px;border-top:1px solid #e5e5e5;font-size:10px;opacity:.5">
    Vendu par ${esc(legalFooter())}.
    <a href="${esc(config.publicUrl)}/cgv" style="color:inherit">CGV</a>
  </p>`;

const customerText = (order) =>
  [
    'Merci, ta précommande est confirmée.',
    `Commande ${order.number}`,
    '',
    ...order.items.map((i) => `${itemLine(i)} — ${euros(i.unitPrice * i.qty)}`),
    `Livraison — ${order.shipping ? euros(order.shipping) : 'Offerte'}`,
    `Total — ${euros(order.total)}`,
    '',
    config.preorder.shippingEstimate,
    '',
    'Livraison à :',
    ...addressLines(order.shipping_address),
    '',
    `Vendu par ${legalFooter()} — CGV : ${config.publicUrl}/cgv`,
  ].join('\n');

// ------------------------------------------------------------- senders

async function sendMail(message) {
  if (!transporter) {
    console.log(`[mail non envoyé — SMTP non configuré] ${message.subject} → ${message.to}`);
    return false;
  }
  await transporter.sendMail({ from: notify.from, replyTo: notify.replyTo, ...message });
  return true;
}

async function sendTelegram(text) {
  const { token, chatId } = notify.telegram;
  if (!token || !chatId) return false;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${await res.text()}`);
  return true;
}

// Resolves to true if at least one team channel delivered.
async function notifyNewOrder(order) {
  const jobs = [];

  if (notify.emails.length) {
    jobs.push(
      sendMail({
        to: notify.emails.join(', '),
        replyTo: order.email,
        subject: `🛒 Nouvelle commande ${order.number} — ${euros(order.total)}`,
        text: teamText(order),
        html: teamHtml(order),
      })
    );
  }
  jobs.push(sendTelegram(teamText(order)));

  const results = await Promise.allSettled(jobs);
  results
    .filter((r) => r.status === 'rejected')
    .forEach((r) => console.error(`Notification équipe échouée (${order.number}):`, r.reason));
  const teamNotified = results.some((r) => r.status === 'fulfilled' && r.value);

  if (notify.sendCustomerEmail) {
    try {
      await sendMail({
        to: order.email,
        subject: `Ta précommande ${order.number} est confirmée — Lycée Musical`,
        text: customerText(order),
        html: customerHtml(order),
      });
    } catch (err) {
      console.error(`Email client échoué (${order.number}):`, err);
    }
  }

  return teamNotified;
}

// Anything the team must act on (dispute, anomaly) — every channel.
async function notifyAlert(subject, text) {
  const jobs = [sendTelegram(`${subject}\n\n${text}`)];
  if (notify.emails.length) jobs.push(sendMail({ to: notify.emails.join(', '), subject, text }));
  const results = await Promise.allSettled(jobs);
  results.filter((r) => r.status === 'rejected').forEach((r) => console.error('Alerte non envoyée :', r.reason));
}

async function notifyShipped(order) {
  if (!notify.sendCustomerEmail) return false;
  const tracking = order.tracking ? String(order.tracking).trim() : '';
  const trackingUrl = /^https?:\/\//.test(tracking) ? tracking : null;
  return sendMail({
    to: order.email,
    subject: `Ta commande ${order.number} est en route — Lycée Musical`,
    text: [
      `Bonne nouvelle : ta commande ${order.number} vient d'être expédiée.`,
      '',
      ...order.items.map(itemLine),
      '',
      tracking ? `Suivi : ${tracking}` : '',
      '',
      `Vendu par ${legalFooter()}`,
    ].join('\n'),
    html: `
      <div style="font-family:ui-monospace,Menlo,monospace;font-size:14px;color:#000;line-height:1.7;max-width:560px">
        <p style="font-size:11px;letter-spacing:.25em;margin:0">LUVBFK — LYCÉE MUSICAL</p>
        <h1 style="font-size:24px;margin:8px 0 16px">Ta commande est en route.</h1>
        <p style="margin:0 0 16px">Commande <b>${esc(order.number)}</b></p>
        <p style="margin:0 0 16px">${order.items.map((i) => esc(itemLine(i))).join('<br>')}</p>
        ${
          tracking
            ? `<p style="margin:0 0 16px">Suivi : ${
                trackingUrl ? `<a href="${esc(trackingUrl)}">${esc(trackingUrl)}</a>` : `<b>${esc(tracking)}</b>`
              }</p>`
            : ''
        }
        ${legalFooterHtml()}
      </div>`,
  });
}

const verifySmtp = async () => {
  if (!transporter) return false;
  await transporter.verify();
  return true;
};

module.exports = { notifyNewOrder, notifyAlert, notifyShipped, verifySmtp, euros };
