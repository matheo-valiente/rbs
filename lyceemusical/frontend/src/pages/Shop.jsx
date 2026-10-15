import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Countdown from '../components/Countdown.jsx';
import ProductVisual from '../components/ProductVisual.jsx';
import { EP_TITLE, SIZE_GUIDE } from '../config.js';
import { euros, parisDate } from '../lib/format.js';
import styles from './Shop.module.css';

function StatusBar() {
  const { shop, phase, offset } = useShop();
  if (!shop) return <div className={styles.status}>[ CHARGEMENT ]</div>;

  if (phase === 'paused') {
    return (
      <div className={`${styles.status} ${styles.statusOpen}`}>
        <span>
          <i className={styles.dot} /> {shop.preorder.pausedMessage.toUpperCase()}
        </span>
      </div>
    );
  }

  if (phase === 'upcoming') {
    return (
      <div className={styles.status}>
        <span>
          OUVERTURE LE{' '}
          {parisDate(shop.preorder.opensAt, { weekday: 'long', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
        </span>
        <Countdown target={shop.preorder.opensAt} offset={offset} />
      </div>
    );
  }
  if (phase === 'open') {
    return (
      <div className={`${styles.status} ${styles.statusOpen}`}>
        <span>
          <i className={styles.dot} /> PRÉCOMMANDES OUVERTES — FIN DANS
        </span>
        <Countdown target={shop.preorder.closesAt} offset={offset} />
      </div>
    );
  }
  return (
    <div className={styles.status}>
      <span>PRÉCOMMANDES TERMINÉES — MERCI À TOUS</span>
    </div>
  );
}

function ProductCard({ product, index }) {
  const { phase, shop } = useShop();
  const cart = useCart();
  const [size, setSize] = useState(null);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  const needsSize = !!product.sizes;
  const limitReached = !cart.canAdd(product.id);
  const disabled = phase !== 'open' || limitReached;

  const add = () => {
    if (needsSize && !size) {
      setError('Choisis ta taille.');
      return;
    }
    const res = cart.add(product.id, size, 1);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    cart.open();
  };

  let label = 'AJOUTER AU PANIER';
  if (phase === 'paused') label = shop.preorder.pausedMessage.toUpperCase();
  else if (phase === 'upcoming') label = 'BIENTÔT DISPONIBLE';
  else if (phase === 'closed') label = 'PRÉCOMMANDES TERMINÉES';
  else if (limitReached) label = 'LIMITE ATTEINTE';
  else if (added) label = 'AJOUTÉ ✓';

  return (
    <motion.article
      className={`${styles.card} ${product.featured ? styles.featured : ''} product-hover`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <div className={styles.visual}>
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
        <ProductVisual product={product} />
      </div>

      <div className={styles.cardBody}>
        <div className={styles.nameRow}>
          <h2 className={styles.name}>{noBreakHyphens(product.name)}</h2>
          <div className={styles.price}>
            {product.compareAtPrice && (
              <span className={styles.was}>
                <s>{euros(product.compareAtPrice)}</s>
                {product.teaser?.priceNote && <small>{product.teaser.priceNote}</small>}
              </span>
            )}
            <span>{euros(product.price)}</span>
          </div>
        </div>

        <p className={styles.tagline}>{product.tagline}</p>

        {needsSize && (
          <div className={styles.sizeBlock}>
            {hasSizeGuide && (
              <div className={styles.label}>
                <a href="#guide-tailles" className={styles.guideLink}>
                  GUIDE DES TAILLES
                </a>
              </div>
            )}
            <div className={styles.sizes} role="radiogroup" aria-label="Taille">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={size === s}
                  className={`${styles.size} ${size === s ? styles.sizeActive : ''}`}
                  onClick={() => {
                    setSize(s);
                    setError(null);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <button type="button" className={styles.add} onClick={add} disabled={disabled}>
          {label}
        </button>
      </div>
    </motion.article>
  );
}

// Only show the size guide once real measurements are filled in config.js.
const hasSizeGuide = SIZE_GUIDE.some((r) => r.chest !== '—');

// Keeps hyphenated words (« T-SHIRT ») on one line on narrow phones.
function noBreakHyphens(text) {
  return text.split(' ').map((w, i) => (
    <span key={i}>
      {i > 0 && ' '}
      {w.includes('-') ? <span style={{ whiteSpace: 'nowrap' }}>{w}</span> : w}
    </span>
  ));
}

export default function Shop() {
  const { shop, products, error } = useShop();
  const cart = useCart();
  const [params, setParams] = useSearchParams();

  // Back from a cancelled Stripe checkout → reopen the cart where they left it.
  useEffect(() => {
    if (params.get('panier') === '1') {
      cart.open();
      setParams({}, { replace: true });
    }
  }, [params, setParams, cart]);

  return (
    <div className={styles.page}>
      <StatusBar />

      <header className={styles.header}>
        <h1 className={styles.title}>{EP_TITLE}</h1>
        <p className={styles.intro}>Précommande{shop ? ` jusqu’au ${parisDate(shop.preorder.closesAt)}` : ''}.</p>
      </header>

      {error && !shop && <div className={styles.loading}>[ CONNEXION À LA BOUTIQUE… ]</div>}

      <section className={styles.grid}>
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </section>

      <section className={styles.reassurance}>
        <span>
          <strong>Paiement sécurisé</strong> Stripe
        </span>
        <span>
          <strong>Livraison</strong> {shop ? (shop.shipping.feeCents ? euros(shop.shipping.feeCents) : 'offerte') : '—'}
        </span>
        <span>
          <strong>Max</strong> {shop ? `${shop.limits.cd} CD · ${shop.limits.tshirt} t-shirts` : '—'} / personne
        </span>
      </section>

      {hasSizeGuide && (
        <section className={styles.infoGrid}>
          <div id="guide-tailles" className={styles.infoBlock}>
            <div className={styles.index}>GUIDE DES TAILLES</div>
            <table className={styles.sizeTable}>
              <thead>
                <tr>
                  <th>TAILLE</th>
                  <th>LARGEUR (CM)</th>
                  <th>LONGUEUR (CM)</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.map((r) => (
                  <tr key={r.size}>
                    <td>{r.size}</td>
                    <td>{r.chest}</td>
                    <td>{r.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
