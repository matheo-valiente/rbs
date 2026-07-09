import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePaymentStatus from '../hooks/usePaymentStatus.js';
import styles from './StoreSuccess.module.css';

export default function StoreSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const { data, state } = usePaymentStatus('/api/orders', sessionId);

  return (
    <div className={styles.page}>
      <header className={styles.headBar}>
        <div className={styles.headLeft}>
          <span className={styles.headLabel}>STORE</span>
          <span className={styles.headSep}>—</span>
          <span>RBS</span>
        </div>
      </header>

      <section className={styles.block}>
        {state === 'loading' && (
          <div className={styles.pending}>[ CONFIRMATION DU PAIEMENT… ]</div>
        )}

        {state === 'timeout' && (
          <div className={styles.pending}>
            [ PAIEMENT EN COURS DE TRAITEMENT — un email de confirmation
            arrive sous peu ]
          </div>
        )}

        {state === 'error' && (
          <div className={styles.pending}>
            [ COMMANDE INTROUVABLE — contacte-nous si le montant a été
            débité ]
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
            <h1 className={styles.title}>MERCI</h1>
            <div className={styles.sub}>COMMANDE CONFIRMÉE</div>
            <div className={styles.meta}>
              {data.productName} — TAILLE {data.size}
            </div>
          </motion.div>
        )}

        <Link to="/store" className={styles.back}>
          ← RETOUR AU STORE
        </Link>
      </section>
    </div>
  );
}
