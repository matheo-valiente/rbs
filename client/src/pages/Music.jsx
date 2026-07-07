import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlaceholder from '../components/VideoPlaceholder.jsx';
import DragCarousel from '../components/DragCarousel.jsx';
import styles from './Music.module.css';

export default function Music() {
  const [tracks, setTracks] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    fetch('/api/tracks')
      .then((r) => r.json())
      .then(setTracks)
      .catch(() => {});
  }, []);

  const close = useCallback(() => setOpen(null), []);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close]);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headLeft}>
          <span className={styles.headLabel}>MUSIC</span>
          <span className={styles.headSep}>—</span>
          <span>RBS</span>
        </div>
        <div className={styles.headRight}>{tracks.length} VIDEOS · 2024 — 2025</div>
      </header>

      <section className={styles.heroBlock}>
        <h1 className={styles.title}>
          MUSIC <span className={styles.titleSlash}>/</span>{' '}
          <span className={styles.titleAlt}>SESSIONS</span>
        </h1>
        <div className={styles.intro}>
          Sessions live, freestyles, clips. Toutes les vidéos RBS,
          studio et scène. Glissez pour parcourir.
        </div>
      </section>

      <section className={styles.carousel}>
        <DragCarousel ariaLabel="RBS music videos" hintLabel="DRAG TO MOVE">
          {tracks.map((t, i) => (
            <article
              key={t.id}
              data-card
              className={styles.card}
              onClick={() => setOpen(t)}
            >
              <div className={styles.cardIndex}>
                {String(i + 1).padStart(2, '0')} / {String(tracks.length).padStart(2, '0')}
              </div>
              <div className={styles.cardMedia}>
                <VideoPlaceholder
                  src={t.video}
                  label="[ VIDEO À VENIR ]"
                  ratio="4/5"
                />
                <div className={styles.play}>
                  <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="21" stroke="#fff" strokeWidth="1.2" fill="rgba(0,0,0,0.5)" />
                    <path d="M18 14 L31 22 L18 30 Z" fill="#fff" />
                  </svg>
                </div>
              </div>
              <div className={styles.cardCaption}>
                <h2 className={styles.cardTitle}>
                  {t.title.replace(/^RBS\s*—\s*/, '')}{' '}
                  <span className={styles.cardCreditFor}>FOR</span>{' '}
                  <span className={styles.cardCredit}>@RBS</span>
                </h2>
                <div className={styles.cardYear}>{t.description}</div>
              </div>
            </article>
          ))}
        </DragCarousel>
      </section>

      <AnimatePresence>
        {open && (
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
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                className={styles.modalClose}
                onClick={close}
                aria-label="Close"
              >
                ✕
              </button>
              <div className={styles.modalVideoWrap}>
                <VideoPlaceholder
                  src={open.video}
                  label="[ VIDEO À VENIR ]"
                  ratio="16/9"
                  controls
                  autoPlay
                />
              </div>
              <div className={styles.modalCaption}>
                <div className={styles.modalTitle}>{open.title}</div>
                <div className={styles.modalDesc}>{open.description}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
