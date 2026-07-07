import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DragCarousel from '../components/DragCarousel.jsx';
import VideoPlaceholder from '../components/VideoPlaceholder.jsx';
import Newsletter from '../components/Newsletter.jsx';
import styles from './Live.module.css';

export default function Live() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => {});
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headLeft}>
          <span className={styles.headLabel}>LIVE</span>
          <span className={styles.headSep}>—</span>
          <span>RBS</span>
        </div>
        <div className={styles.headRight}>
          {events.length} EVENTS · 2025 — 2026
        </div>
      </header>

      <section className={styles.heroBlock}>
        <h1 className={styles.title}>
          LIVE <span className={styles.titleSlash}>/</span>{' '}
          <span className={styles.titleAlt}>NIGHTS</span>
        </h1>
        <div className={styles.intro}>
          Toutes les nuits RBS. Paris et au-delà. Réservation via la billetterie.
        </div>
      </section>

      <section className={styles.carousel}>
        <DragCarousel ariaLabel="RBS upcoming events" hintLabel="DRAG TO MOVE">
          {events.map((ev, i) => {
            const upcoming = (ev.date || '').includes('À VENIR');
            return (
              <motion.article
                key={ev.id}
                data-card
                className={styles.card}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <div className={styles.cardIndex}>
                  {String(i + 1).padStart(2, '0')} / {String(events.length).padStart(2, '0')}
                  {upcoming && (
                    <span className={styles.upcoming}>
                      <span className={styles.dot} /> UPCOMING
                    </span>
                  )}
                </div>

                <div className={styles.cardMedia}>
                  <VideoPlaceholder label="[ POSTER À VENIR ]" ratio="4/5" />
                  <div className={styles.cardOverlay}>
                    <div className={styles.cardOverlayTop}>
                      <span>{ev.location}</span>
                      <span>{ev.price}</span>
                    </div>
                    <div className={styles.cardOverlayName}>{ev.name}</div>
                    <div className={styles.cardOverlayBottom}>
                      <span>{ev.date}</span>
                      <Link to="/ticket-office" className={styles.cardCta}>
                        BOOK →
                      </Link>
                    </div>
                  </div>
                </div>

                <div className={styles.cardCaption}>
                  <h2 className={styles.cardTitle}>
                    {ev.name}{' '}
                    <span className={styles.cardCreditFor}>FOR</span>{' '}
                    <span className={styles.cardCredit}>
                      @{ev.location.split(',')[0].toUpperCase().replace(/\s/g, '_')}
                    </span>
                  </h2>
                  <div className={styles.cardYear}>{ev.date}</div>
                </div>
              </motion.article>
            );
          })}
        </DragCarousel>
      </section>

      <Newsletter />
    </div>
  );
}
