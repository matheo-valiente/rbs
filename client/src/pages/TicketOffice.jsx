import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Countdown from '../components/Countdown.jsx';
import styles from './TicketOffice.module.css';

const isDateConfirmed = (date) => {
  const parsed = Date.parse(date);
  return !Number.isNaN(parsed) && parsed > Date.now();
};

export default function TicketOffice() {
  const [events, setEvents] = useState([]);
  const [checkingOutId, setCheckingOutId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => {});
  }, []);

  const startCheckout = useCallback(async (eventId) => {
    setCheckingOutId(eventId);
    setError(null);
    try {
      const res = await fetch('/api/checkout/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (err) {
      setError('Paiement indisponible pour le moment. Réessaie dans un instant.');
      setCheckingOutId(null);
    }
  }, []);

  return (
    <div className={styles.page}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.list}>
        {events.map((ev, i) => {
          const confirmed = isDateConfirmed(ev.date);
          return (
            <motion.article
              key={ev.id}
              className={styles.row}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <div className={styles.num}>{String(i + 1).padStart(2, '0')}</div>

              <div className={styles.center}>
                <h2 className={styles.evName}>{ev.name}</h2>
                <div className={styles.evMeta}>
                  <span>{ev.location}</span>
                  {confirmed && (
                    <>
                      <span className={styles.dot}>·</span>
                      <span>{ev.date}</span>
                    </>
                  )}
                </div>
                {!confirmed && (
                  <div className={styles.soon}>
                    DATE BIENTÔT ANNONCÉE
                  </div>
                )}
                {confirmed && <Countdown target={ev.date} />}
              </div>

              <div className={styles.right}>
                <div className={styles.price}>{ev.price}</div>
                {confirmed ? (
                  <button
                    className={styles.btn}
                    disabled={checkingOutId === ev.id}
                    onClick={() => startCheckout(ev.id)}
                  >
                    {checkingOutId === ev.id ? 'REDIRECTION…' : 'GET TICKET'}{' '}
                    <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  <button className={styles.btnDisabled} disabled>
                    BIENTÔT
                  </button>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
