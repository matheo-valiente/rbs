const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const fmtRound = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

// 2500 -> "25 €", 2550 -> "25,50 €"
export const euros = (cents) => (cents % 100 === 0 ? fmtRound : fmt).format(cents / 100);

export const parisDate = (iso, opts = {}) =>
  new Date(iso).toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    day: 'numeric',
    month: 'long',
    ...opts
  });
