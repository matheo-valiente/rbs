const { getProduct } = require('./catalog');
const config = require('./config');

class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const normalizeEmail = (raw) => {
  const email = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    throw new HttpError(400, 'Adresse email invalide.', 'invalid_email');
  }
  return email;
};

// Turns the untrusted client cart into priced, merged lines.
const normalizeCart = (rawItems) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new HttpError(400, 'Ton panier est vide.', 'empty_cart');
  }
  if (rawItems.length > 20) throw new HttpError(400, 'Panier invalide.', 'invalid_cart');

  const merged = new Map();
  for (const raw of rawItems) {
    const product = getProduct(raw && raw.productId);
    const qty = Number(raw && raw.qty);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 10) {
      throw new HttpError(400, 'Panier invalide.', 'invalid_cart');
    }

    let size = null;
    if (product.sizes) {
      size = raw.size;
      if (!product.sizes.includes(size)) {
        throw new HttpError(400, `Choisis une taille pour « ${product.name} ».`, 'size_required');
      }
    }

    const key = `${product.id}:${size || ''}`;
    const line = merged.get(key) || {
      productId: product.id,
      name: product.name,
      size,
      qty: 0,
      unitPrice: product.price,
    };
    line.qty += qty;
    merged.set(key, line);
  }

  const items = [...merged.values()];
  const counts = { cd: 0, tshirt: 0 };
  let subtotal = 0;
  for (const line of items) {
    const product = getProduct(line.productId);
    counts.cd += product.contains.cd * line.qty;
    counts.tshirt += product.contains.tshirt * line.qty;
    subtotal += line.unitPrice * line.qty;
  }

  return { items, counts, subtotal };
};

const assertWithinLimits = (counts, alreadyOrdered = { cd: 0, tshirt: 0 }) => {
  const { limits } = config;
  const cd = counts.cd + alreadyOrdered.cd;
  const tshirt = counts.tshirt + alreadyOrdered.tshirt;
  const prior = alreadyOrdered.cd + alreadyOrdered.tshirt > 0;

  const message = (label, max, already) =>
    prior
      ? `Limite de ${max} ${label} par personne : tu en as déjà ${already} en commande avec cette adresse email.`
      : `Limite de ${max} ${label} par personne (packs inclus).`;

  if (cd > limits.cd) throw new HttpError(409, message('CD', limits.cd, alreadyOrdered.cd), 'limit_cd');
  if (tshirt > limits.tshirt)
    throw new HttpError(409, message('t-shirts', limits.tshirt, alreadyOrdered.tshirt), 'limit_tshirt');
};

const preorderPhase = (at = new Date()) => {
  if (config.preorder.paused) return 'paused';
  if (at < config.preorder.opensAt) return 'upcoming';
  if (at > config.preorder.closesAt) return 'closed';
  return 'open';
};

module.exports = { HttpError, normalizeEmail, normalizeCart, assertWithinLimits, preorderPhase };
