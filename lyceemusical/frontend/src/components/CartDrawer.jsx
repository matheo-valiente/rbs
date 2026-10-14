import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import { useShop } from '../context/ShopContext.jsx';
import { euros, parisDate } from '../lib/format.js';
import ProductVisual from './ProductVisual.jsx';
import { LockIcon } from './Icons.jsx';
import styles from './CartDrawer.module.css';

const EMAIL_KEY = 'lm-email';

export default function CartDrawer() {
  const cart = useCart();
  const { shop, phase, getProduct } = useShop();
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(EMAIL_KEY) || '';
    } catch {
      return '';
    }
  });
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!cart.isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && cart.close();
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [cart.isOpen, cart.close]);

  useEffect(() => setError(null), [cart.lines.length]);

  const fee = shop?.shipping.feeCents ?? 0;
  const total = cart.subtotal + (cart.lines.length ? fee : 0);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const canPay = phase === 'open' && cart.lines.length > 0 && emailValid && terms && !submitting;

  const changeQty = (key, qty) => {
    const res = cart.setQty(key, qty);
    setError(res.ok ? null : res.error);
  };

  const checkout = async (e) => {
    e.preventDefault();
    if (!canPay) return;
    setSubmitting(true);
    setError(null);
    try {
      localStorage.setItem(EMAIL_KEY, email.trim());
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          acceptTerms: terms,
          items: cart.lines.map(({ productId, size, qty }) => ({ productId, size, qty }))
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || 'Paiement indisponible pour le moment.');
      window.location.assign(data.url);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  let blocker = null;
  if (phase === 'upcoming' && shop)
    blocker = `Ouverture des précommandes le ${parisDate(shop.preorder.opensAt, { hour: '2-digit', minute: '2-digit' })}.`;
  if (phase === 'closed') blocker = 'Les précommandes sont terminées.';

  return (
    <AnimatePresence>
      {cart.isOpen && (
        <motion.div
          className={styles.backdrop}
          onClick={cart.close}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Panier"
            className={styles.panel}
            onClick={(e) => e.stopPropagation()}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className={styles.head}>
              <span>PANIER ({cart.itemCount})</span>
              <button type="button" className={styles.close} onClick={cart.close} aria-label="Fermer le panier">
                ✕
              </button>
            </header>

            {cart.lines.length === 0 ? (
              <div className={styles.empty}>
                <p>[ TON PANIER EST VIDE ]</p>
                <Link to="/boutique" className={styles.emptyLink} onClick={cart.close}>
                  VOIR LA BOUTIQUE →
                </Link>
              </div>
            ) : (
              <form className={styles.body} onSubmit={checkout}>
                <ul className={styles.lines}>
                  {cart.lines.map((line) => {
                    const product = getProduct(line.productId);
                    if (!product) return null;
                    return (
                      <li key={line.key} className={styles.line}>
                        <ProductVisual product={product} size="thumb" />
                        <div className={styles.lineInfo}>
                          <div className={styles.lineName}>{product.name}</div>
                          {line.size && <div className={styles.lineMeta}>TAILLE {line.size}</div>}
                          <div className={styles.lineBottom}>
                            <div className={styles.stepper}>
                              <button
                                type="button"
                                onClick={() => changeQty(line.key, line.qty - 1)}
                                aria-label="Retirer un"
                              >
                                −
                              </button>
                              <span aria-live="polite">{line.qty}</span>
                              <button
                                type="button"
                                onClick={() => changeQty(line.key, line.qty + 1)}
                                aria-label="Ajouter un"
                              >
                                +
                              </button>
                            </div>
                            <span className={styles.linePrice}>{euros(product.price * line.qty)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.remove}
                          onClick={() => cart.remove(line.key)}
                          aria-label={`Supprimer ${product.name}`}
                        >
                          SUPPR.
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className={styles.totals}>
                  <div>
                    <span>SOUS-TOTAL</span>
                    <span>{euros(cart.subtotal)}</span>
                  </div>
                  <div>
                    <span>LIVRAISON</span>
                    <span>{fee ? euros(fee) : 'OFFERTE'}</span>
                  </div>
                  <div className={styles.total}>
                    <span>TOTAL</span>
                    <span>{euros(total)}</span>
                  </div>
                  <p className={styles.estimate}>
                    {shop?.business.vatRegime === 'franchise' ? 'TVA non applicable' : 'TVA incluse'} · Précommande
                  </p>
                </div>

                <label className={styles.field}>
                  <span>EMAIL</span>
                  <input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    placeholder="ton@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>

                <label className={styles.check}>
                  <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                  <span>
                    J’accepte les{' '}
                    <Link to="/cgv" target="_blank">
                      CGV
                    </Link>{' '}
                    (précommande, expédiée après la clôture).
                  </span>
                </label>

                {(error || blocker) && <p className={styles.error}>{error || blocker}</p>}

                <button type="submit" className={styles.pay} disabled={!canPay}>
                  {submitting ? 'REDIRECTION VERS LE PAIEMENT…' : `PAYER ${euros(total)}`}
                </button>

                <p className={styles.secure}>
                  <LockIcon /> Paiement sécurisé par Stripe
                </p>
              </form>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
