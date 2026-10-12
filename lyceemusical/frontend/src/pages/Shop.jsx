import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Countdown from '../components/Countdown.jsx';
import ProductVisual from '../components/ProductVisual.jsx';
import { ARTIST, EP_TITLE, SIZE_GUIDE, CONTACT_EMAIL } from '../config.js';
import { euros, parisDate } from '../lib/format.js';
import styles from './Shop.module.css';

function StatusBar() {
  const { shop, phase, offset } = useShop();
  if (!shop) return <div className={styles.status}>[ CHARGEMENT ]</div>;

  if (phase === 'upcoming') {
    return (
      <div className={styles.status}>
        <span>OUVERTURE LE {parisDate(shop.preorder.opensAt, { weekday: 'long', hour: '2-digit', minute: '2-digit' }).toUpperCase()}</span>
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
  const { phase } = useShop();
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
  if (phase === 'upcoming') label = 'BIENTÔT DISPONIBLE';
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
          <h2 className={styles.name}>{product.name}</h2>
          <div className={styles.price}>
            {product.compareAtPrice && <s>{euros(product.compareAtPrice)}</s>}
            <span>{euros(product.price)}</span>
          </div>
        </div>

        {product.compareAtPrice && (
          <div className={styles.saving}>TU ÉCONOMISES {euros(product.compareAtPrice - product.price)}</div>
        )}

        <ul className={styles.includes}>
          {product.includes.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        {needsSize && (
          <div className={styles.sizeBlock}>
            <div className={styles.label}>
              <span>TAILLE</span>
              <a href="#guide-tailles" className={styles.guideLink}>
                GUIDE DES TAILLES
              </a>
            </div>
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

const FAQ = (shop) => [
  {
    q: 'Quand vais-je recevoir ma commande ?',
    a: `Il s’agit d’une précommande : les articles sont produits puis expédiés après la clôture. ${shop?.preorder.shippingEstimate || ''}`
  },
  {
    q: 'Combien puis-je commander ?',
    a: `Maximum ${shop?.limits.cd ?? 3} CD et ${shop?.limits.tshirt ?? 3} t-shirts par personne (les packs comptent pour 1 CD + 1 t-shirt), toutes commandes confondues avec la même adresse email.`
  },
  {
    q: 'Le paiement est-il sécurisé ?',
    a: 'Oui. Le paiement est géré par Stripe (CB, Visa, Mastercard, Apple Pay, Google Pay). Tes informations bancaires sont saisies sur la page sécurisée de Stripe et ne transitent jamais par notre site.'
  },
  {
    q: 'Où livrez-vous ? Combien coûte la livraison ?',
    a: `Livraison à domicile ${shop?.shipping.countries.includes('BE') ? 'en France, Belgique, Suisse, Luxembourg et Monaco' : 'en France'}. Frais de port : ${shop ? (shop.shipping.feeCents ? euros(shop.shipping.feeCents) : 'offerts') : '—'} par commande.`
  },
  {
    q: 'Je me suis trompé de taille / je veux annuler.',
    a: `Écris-nous à ${CONTACT_EMAIL} avec ton numéro de commande (LM-XXXX) avant la clôture des précommandes. Tu disposes aussi d’un droit de rétractation de 14 jours après réception (voir CGV).`
  }
];

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
        <div className={styles.index}>PRÉCOMMANDE — {ARTIST}</div>
        <h1 className={styles.title}>{EP_TITLE}</h1>
        <p className={styles.intro}>
          L’EP en CD et le t-shirt officiel, en édition précommande
          {shop ? ` jusqu’au ${parisDate(shop.preorder.closesAt)}` : ''} uniquement.
        </p>
      </header>

      {error && !shop && <div className={styles.loading}>[ CONNEXION À LA BOUTIQUE… ]</div>}

      <section className={styles.grid}>
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </section>

      <section className={styles.reassurance}>
        <div>
          <strong>PAIEMENT SÉCURISÉ</strong>
          <span>Stripe — CB, Apple Pay, Google Pay</span>
        </div>
        <div>
          <strong>PRÉCOMMANDE</strong>
          <span>{shop?.preorder.shippingEstimate || 'Expédition après la clôture'}</span>
        </div>
        <div>
          <strong>LIVRAISON À DOMICILE</strong>
          <span>{shop ? (shop.shipping.feeCents ? `${euros(shop.shipping.feeCents)} par commande` : 'Offerte') : '—'}</span>
        </div>
        <div>
          <strong>ÉDITION LIMITÉE</strong>
          <span>
            {shop ? `${shop.limits.cd} CD et ${shop.limits.tshirt} t-shirts max / personne` : '—'}
          </span>
        </div>
      </section>

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
          <p className={styles.note}>[ COUPE / MATIÈRE À COMPLÉTER ]</p>
        </div>

        <div className={styles.infoBlock}>
          <div className={styles.index}>QUESTIONS FRÉQUENTES</div>
          <div className={styles.faq}>
            {FAQ(shop).map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
