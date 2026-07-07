import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from './TicketOffice.module.css';

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
      <header className={styles.headBar}>
        <div className={styles.headLeft}>
          <span className={styles.headLabel}>TICKETS</span>
          <span className={styles.headSep}>—</span>
          <span>RBS</span>
        </div>
        <div className={styles.headRight}>
          BILLETTERIE OFFICIELLE · {events.length} EVENTS
        </div>
      </header>

      <section className={styles.heroBlock}>
        <h1 className={styles.title}>
          TICKETS <span className={styles.titleSlash}>/</span>{' '}
          <span className={styles.titleAlt}>OFFICE</span>
        </h1>
        <div className={styles.intro}>
          Toutes les nuits RBS. Réservation sécurisée, paiement instantané,
          QR code envoyé par email.
        </div>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.list}>
        {events.map((ev, i) => (
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
                <span className={styles.dot}>·</span>
                <span>{ev.date}</span>
              </div>
            </div>

            <div className={styles.right}>
              <div className={styles.price}>{ev.price}</div>
              <button
                className={styles.btn}
                disabled={checkingOutId === ev.id}
                onClick={() => startCheckout(ev.id)}
              >
                {checkingOutId === ev.id ? 'REDIRECTION…' : 'GET TICKET'}{' '}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
