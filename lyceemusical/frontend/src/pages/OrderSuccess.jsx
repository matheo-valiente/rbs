import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import { useShop } from '../context/ShopContext.jsx';
import { CONTACT_EMAIL } from '../config.js';
import { euros } from '../lib/format.js';
import styles from './OrderSuccess.module.css';

// Stripe's webhook (not this redirect) confirms payment — poll until it lands.
function useOrderStatus(sessionId, { maxAttempts = 20, intervalMs = 1500 } = {}) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | paid | timeout | error

  useEffect(() => {
    if (!sessionId) {
      setState('error');
      return;
    }
    let attempts = 0;
    let cancelled = false;
    let timer;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(sessionId)}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (cancelled) return;
        setData(json);
        if (json.status === 'paid') return setState('paid');
      } catch {
        if (cancelled) return;
      }
      if (attempts >= maxAttempts) return setState((s) => (s === 'loading' ? 'timeout' : s));
      timer = setTimeout(poll, intervalMs);
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionId, maxAttempts, intervalMs]);

  return { data, state };
}

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const { data, state } = useOrderStatus(sessionId);
  const { clear } = useCart();
  const { shop } = useShop();

  // Reaching this page means Stripe accepted the payment — empty the cart.
  useEffect(() => {
    if (sessionId) clear();
  }, [sessionId, clear]);

  return (
    <div className={styles.page}>
      <section className={styles.block}>
        {state === 'loading' && <div className={styles.pending}>[ CONFIRMATION DU PAIEMENT… ]</div>}

        {state === 'timeout' && (
          <div className={styles.pending}>
            [ PAIEMENT EN COURS DE TRAITEMENT — tu vas recevoir un email de confirmation d’ici quelques minutes ]
          </div>
        )}

        {state === 'error' && (
          <div className={styles.pending}>
            [ COMMANDE INTROUVABLE — si ton compte a été débité, écris-nous à {CONTACT_EMAIL} ]
          </div>
        )}

        {state === 'paid' && data && (
          <motion.div
            className={styles.success}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.check}>✓</div>
            <h1 className={styles.title}>MERCI !</h1>
            <div className={styles.sub}>PRÉCOMMANDE {data.number} CONFIRMÉE</div>

            <table className={styles.recap}>
              <tbody>
                {data.items.map((i) => (
                  <tr key={`${i.productId}-${i.size}`}>
                    <td>
                      {i.qty} × {i.name}
                      {i.size ? ` — ${i.size}` : ''}
                    </td>
                    <td>{euros(i.unitPrice * i.qty)}</td>
                  </tr>
                ))}
                <tr>
                  <td>LIVRAISON</td>
                  <td>{data.shipping ? euros(data.shipping) : 'OFFERTE'}</td>
                </tr>
                <tr className={styles.total}>
                  <td>TOTAL</td>
                  <td>{euros(data.total)}</td>
                </tr>
              </tbody>
            </table>

            <p className={styles.info}>
              Un email de confirmation vient de t’être envoyé.
              {shop?.preorder.shippingEstimate ? ` ${shop.preorder.shippingEstimate}.` : ''}
            </p>
          </motion.div>
        )}

        <Link to="/" className={styles.back}>
          ← RETOUR À L’ACCUEIL
        </Link>
      </section>
    </div>
  );
}
