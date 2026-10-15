import { useState } from 'react';
import { useShop } from '../context/ShopContext';
import Countdown from './Countdown';
import { MEDIA } from '../config';
import styles from './ProductVisual.module.css';

// Drawn stand-ins until the real product photos arrive: set `image` in
// backend/src/catalog.js and the photo replaces them automatically.
const Disc = ({ className }) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
    <rect x="18" y="18" width="164" height="164" fill="#fff" stroke="#000" strokeWidth="2" />
    <circle cx="112" cy="100" r="70" fill="#000" />
    <circle cx="112" cy="100" r="50" fill="none" stroke="#333" strokeWidth="1" />
    <circle cx="112" cy="100" r="34" fill="none" stroke="#333" strokeWidth="1" />
    <circle cx="112" cy="100" r="18" fill="#ff1111" />
    <circle cx="112" cy="100" r="4" fill="#fff" />
    <text x="32" y="44" fontFamily="Inconsolata, monospace" fontSize="11" fontWeight="700" letterSpacing="2">LYCÉE</text>
    <text x="32" y="58" fontFamily="Inconsolata, monospace" fontSize="11" fontWeight="700" letterSpacing="2">MUSICAL</text>
    <text x="32" y="170" fontFamily="Inconsolata, monospace" fontSize="9" letterSpacing="2">LUVBFK</text>
  </svg>
);

const Shirt = ({ className }) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
    <path
      d="M70 28 L46 36 L14 64 L34 92 L52 80 L52 178 L148 178 L148 80 L166 92 L186 64 L154 36 L130 28 Q100 48 70 28 Z"
      fill="#fff"
      stroke="#000"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M70 28 Q100 48 130 28" fill="none" stroke="#000" strokeWidth="2" />
    <text x="100" y="98" textAnchor="middle" fontFamily="Inconsolata, monospace" fontSize="13" fontWeight="800" letterSpacing="2">LYCÉE</text>
    <text x="100" y="114" textAnchor="middle" fontFamily="Inconsolata, monospace" fontSize="13" fontWeight="800" letterSpacing="2">MUSICAL</text>
    <rect x="80" y="122" width="40" height="2" fill="#ff1111" />
  </svg>
);

// T-shirt pas encore dévoilé : silhouette + « ? », sans motif.
const MysteryShirt = ({ className }) => (
  <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
    <path
      d="M70 28 L46 36 L14 64 L34 92 L52 80 L52 178 L148 178 L148 80 L166 92 L186 64 L154 36 L130 28 Q100 48 70 28 Z"
      fill="#111"
      stroke="#fff"
      strokeWidth="2"
      strokeDasharray="6 5"
      strokeLinejoin="round"
    />
    <path d="M70 28 Q100 48 130 28" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="6 5" />
    <text x="100" y="138" textAnchor="middle" fontFamily="Inconsolata, monospace" fontSize="74" fontWeight="800" fill="#ff1111">
      ?
    </text>
  </svg>
);

const Teaser = ({ product, size }) => {
  const { title, reveal, revealAt } = product.teaser;
  const { offset } = useShop() || {};
  const showClock = size !== 'thumb' && revealAt && new Date(revealAt).getTime() > Date.now() + (offset || 0);
  return (
    <div className={`${styles.wrap} ${styles[size]} ${styles.teaser}`} role="img" aria-label={`${title} — ${reveal}`}>
      {size !== 'thumb' && <span className={styles.teaserTitle}>{title}</span>}
      {product.contains.cd > 0 ? (
        <>
          <MysteryShirt className={styles.packShirt} />
          <img src={MEDIA.coverFront} alt="" className={styles.packCover} loading="lazy" />
        </>
      ) : (
        <MysteryShirt className={styles.single} />
      )}
      {showClock && (
        <div className={styles.clock}>
          <span className={styles.clockLabel}>RÉVÉLATION DANS</span>
          <Countdown target={revealAt} offset={offset || 0} />
        </div>
      )}
    </div>
  );
};

export default function ProductVisual({ product, size = 'card' }) {
  if (product.teaser) return <Teaser product={product} size={size} />;
  return <PhotoOrDrawing product={product} size={size} />;
}

function PhotoOrDrawing({ product, size }) {
  const [broken, setBroken] = useState(false);
  const [backBroken, setBackBroken] = useState(false);
  const hasBack = product.imageBack && !backBroken && size !== 'thumb';

  if (product.image && !broken) {
    return (
      <div className={`${styles.wrap} ${styles[size]} ${hasBack ? styles.hasBack : ''}`}>
        <img
          src={product.image}
          alt={product.imageAlt || product.name}
          className={`${styles.photo} ${styles.front}`}
          loading="lazy"
          onError={() => setBroken(true)}
        />
        {hasBack && (
          <img
            src={product.imageBack}
            alt=""
            aria-hidden="true"
            className={`${styles.photo} ${styles.back}`}
            loading="lazy"
            onError={() => setBackBroken(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.wrap} ${styles[size]} ${styles.drawn}`} role="img" aria-label={product.name}>
      {product.id === 'cd' && <Disc className={styles.single} />}
      {product.id === 'tshirt' && <Shirt className={styles.single} />}
      {product.id === 'pack' && (
        <>
          <Shirt className={styles.packShirt} />
          <Disc className={styles.packDisc} />
        </>
      )}
    </div>
  );
}
