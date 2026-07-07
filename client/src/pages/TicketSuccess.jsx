import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePaymentStatus from '../hooks/usePaymentStatus.js';
import styles from './TicketSuccess.module.css';

export default function TicketSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const { data, state } = usePaymentStatus('/api/tickets', sessionId);

  return (
    <div className={styles.page}>
      <header className={styles.headBar}>
        <div className={styles.headLeft}>
          <span className={styles.headLabel}>TICKETS</span>
          <span className={styles.headSep}>—</span>
          <span>RBS</span>
        </div>
      </header>

      <section className={styles.block}>
        {state === 'loading' && (
          <div className={styles.pending}>[ GÉNÉRATION DU BILLET… ]</div>
        )}

        {state === 'timeout' && (
          <div className={styles.pending}>
            [ PAIEMENT EN COURS DE TRAITEMENT — ton billet arrive par email
            sous peu ]
          </div>
        )}

        {state === 'error' && (
          <div className={styles.pending}>
            [ BILLET INTROUVABLE — contacte-nous si le montant a été débité ]
          </div>
        )}

        {state === 'paid' && data && (
          <motion.div
            className={styles.ticket}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.label}>YOUR TICKET</div>
            <h1 className={styles.title}>{data.eventName}</h1>
            <div className={styles.meta}>
              {data.location} · {data.date}
            </div>

            <div className={styles.qrWrap}>
              <img src={data.qr} alt="QR code du billet" width={240} height={240} />
            </div>

            <div className={styles.scan}>Présente ce QR code à l'entrée</div>
            <div className={styles.code}>CODE — {data.code}</div>
          </motion.div>
        )}

        <Link to="/ticket-office" className={styles.back}>
          ← RETOUR À LA BILLETTERIE
        </Link>
      </section>
    </div>
  );
}
