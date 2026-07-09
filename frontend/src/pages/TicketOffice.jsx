import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Countdown from '../components/Countdown.jsx';
import styles from './TicketOffice.module.css';

const REVEAL_DATE = '2026-07-30T00:00:00';

const isDateConfirmed = (date) => {
  const parsed = Date.parse(date);
  return !Number.isNaN(parsed) && parsed > Date.now();
};

const HourglassIcon = () => (
  <svg className={styles.hourglass} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12" />
    <path d="M6 21h12" />
    <path d="M7 3c0 4.2 3 6.4 5 8-2 1.6-5 3.8-5 8" />
    <path d="M17 3c0 4.2-3 6.4-5 8 2 1.6 5 3.8 5 8" />
  </svg>
);

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

  const hasConfirmedEvents = events.some((ev) => isDateConfirmed(ev.date));

  return (
    <div className={styles.page}>
      {error && <div className={styles.error}>{error}</div>}

      {!hasConfirmedEvents ? (
        <div className={styles.reveal}>
          <HourglassIcon />
          <Countdown target={REVEAL_DATE} size="lg" />
        </div>
      ) : (
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
      )}
    </div>
  );
}
