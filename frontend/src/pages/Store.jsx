import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Store.module.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function Store() {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [flipped, setFlipped] = useState({});
  const [size, setSize] = useState(null);

  const toggleFlip = (id) => setFlipped((f) => ({ ...f, [id]: !f[id] }));
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const close = useCallback(() => {
    setSelected(null);
    setSize(null);
    setCheckoutError(null);
  }, []);

  const startCheckout = useCallback(async () => {
    if (!selected || !size) return;
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const res = await fetch('/api/checkout/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selected.id, size }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError('Paiement indisponible pour le moment. Réessaie dans un instant.');
      setCheckingOut(false);
    }
  }, [selected, size]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close]);

  const categories = [...new Set(products.map((p) => p.category))];
  const filters = categories.length > 1 ? ['ALL', ...categories] : [];
  const filtered = active === 'ALL' ? products : products.filter((p) => p.category === active);

  return (
    <div className={styles.page}>
      {filters.length > 0 && (
        <div className={styles.filters}>
          {filters.map((f) => (
            <button
              key={f}
              className={`${styles.filter} ${active === f ? styles.filterActive : ''}`}
              onClick={() => setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>[ CHARGEMENT ]</div>
      ) : (
        <div className={`${styles.grid} ${filters.length === 0 ? styles.noFilters : ''}`}>
          {filtered.map((p, i) => (
            <motion.article
              key={p.id}
              className={styles.card}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              onClick={() => setSelected(p)}
            >
              <div className={`${styles.cardImage} ${flipped[p.id] ? styles.flipped : ''}`}>
                {p.image ? (
                  <>
                    <img src={p.image} alt={p.name} className={styles.cardImgFront} />
                    {p.imageBack && (
                      <img src={p.imageBack} alt={`${p.name} — dos`} className={styles.cardImgBack} />
                    )}
                  </>
                ) : (
                  <span>[ IMAGE À VENIR ]</span>
                )}
                <span className={styles.cardCategory}>{p.category}</span>
                {p.imageBack && (
                  <button
                    type="button"
                    className={styles.flipBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFlip(p.id);
                    }}
                    aria-label="Voir le dos du produit"
                  >
                    ⇄
                  </button>
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{p.name}</div>
                <div className={styles.cardRow}>
                  <span className={styles.cardPrice}>{p.price}</span>
                  <button
                    className={styles.cardBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(p);
                    }}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}


      <AnimatePresence>
        {selected && (
          <motion.div
            className={styles.modalBackdrop}
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                className={styles.modalClose}
                onClick={close}
                aria-label="Close"
              >
                ✕
              </button>

              <div className={styles.modalGrid}>
                <div className={`${styles.modalImage} ${flipped[selected.id] ? styles.flipped : ''}`}>
                  {selected.image ? (
                    <>
                      <img src={selected.image} alt={selected.name} className={styles.cardImgFront} />
                      {selected.imageBack && (
                        <img
                          src={selected.imageBack}
                          alt={`${selected.name} — dos`}
                          className={styles.cardImgBack}
                        />
                      )}
                    </>
                  ) : (
                    <span>[ IMAGE À VENIR ]</span>
                  )}
                  {selected.imageBack && (
                    <button
                      type="button"
                      className={styles.flipBtn}
                      onClick={() => toggleFlip(selected.id)}
                      aria-label="Voir le dos du produit"
                    >
                      ⇄
                    </button>
                  )}
                </div>
                <div className={styles.modalDetails}>
                  <div className={styles.modalCategory}>{selected.category}</div>
                  <h2 className={styles.modalName}>{selected.name}</h2>
                  <div className={styles.modalPrice}>{selected.price}</div>

                  <div className={styles.modalSection}>
                    <div className={styles.modalLabel}>SIZE</div>
                    <div className={styles.sizes}>
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          className={`${styles.size} ${size === s ? styles.sizeActive : ''}`}
                          onClick={() => setSize(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.modalSection}>
                    <div className={styles.modalLabel}>DESCRIPTION</div>
                    <p className={styles.modalDesc}>
                      [ DESCRIPTION PRODUIT À VENIR ] — pièce limitée RBS,
                      coupe oversize, fabrication française.
                    </p>
                  </div>

                  {checkoutError && <p className={styles.checkoutError}>{checkoutError}</p>}

                  <button
                    className={styles.confirm}
                    disabled={!size || checkingOut}
                    onClick={startCheckout}
                  >
                    {checkingOut ? 'REDIRECTION…' : 'CONFIRM ORDER'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
