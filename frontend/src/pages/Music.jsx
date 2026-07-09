import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlaceholder from '../components/VideoPlaceholder.jsx';
import styles from './Music.module.css';

const SPOTIFY_URL = 'https://open.spotify.com/search/RBS';
const APPLE_MUSIC_URL = 'https://music.apple.com/fr/album/%C3%A0-ma-guise-single/1895887018';

const SpotifyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.719-.66 13.439 1.62.361.181.54.78.302 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const AppleMusicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.86 4.44c-.6.71-1.55 1.27-2.5 1.19-.12-.95.35-1.96.9-2.58.6-.7 1.64-1.22 2.48-1.26.1.99-.29 1.96-.88 2.65zm.87 1.38c-1.38-.08-2.55.78-3.21.78-.67 0-1.68-.74-2.78-.72-1.43.02-2.75.83-3.48 2.12-1.49 2.58-.38 6.4 1.06 8.5.7 1.03 1.54 2.18 2.64 2.14 1.06-.04 1.46-.68 2.74-.68 1.28 0 1.64.68 2.76.66 1.14-.02 1.86-1.04 2.56-2.08.8-1.18 1.13-2.33 1.15-2.39-.03-.01-2.2-.85-2.22-3.35-.02-2.09 1.71-3.09 1.79-3.14-.98-1.44-2.5-1.6-3.01-1.64zM9.5 3.5v14.72c0 .43.24.68.65.68h.02c.4 0 .63-.25.63-.68V9.98l6.3-1.31v6.98c0 .43.24.68.64.68h.02c.4 0 .64-.25.64-.68V4.5c0-.5-.28-.72-.76-.62l-7.32 1.52c-.47.1-.72.4-.72.9z" />
  </svg>
);

export default function Music() {
  const [track, setTrack] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('/api/tracks')
      .then((r) => r.json())
      .then((tracks) => setTrack(tracks.find((t) => t.video) || tracks[0] || null))
      .catch(() => {});
  }, []);

  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close]);

  return (
    <div className={styles.page}>
      {track && (
        <section className={styles.featured}>
          <article className={styles.card} onClick={() => setOpen(true)}>
            <div className={styles.cardMedia}>
              <VideoPlaceholder
                src={track.video}
                poster={track.poster}
                label="[ VIDEO À VENIR ]"
                ratio="16/9"
              />
              <div className={styles.play}>
                <svg width="60" height="60" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="21" stroke="#fff" strokeWidth="1.2" fill="rgba(0,0,0,0.5)" />
                  <path d="M18 14 L31 22 L18 30 Z" fill="#fff" />
                </svg>
              </div>
            </div>
            <div className={styles.cardCaption}>
              <h2 className={styles.cardTitle}>{track.title.replace(/^RBS\s*—\s*/, '')}</h2>
              <div className={styles.cardYear}>{track.description}</div>
            </div>
          </article>
        </section>
      )}

      <section className={styles.listen}>
        <div className={styles.listenIndex}>ÉCOUTER</div>
        <div className={styles.listenLinks}>
          <a href={SPOTIFY_URL} target="_blank" rel="noopener noreferrer" className={styles.listenLink}>
            <SpotifyIcon /> SPOTIFY
          </a>
          <a href={APPLE_MUSIC_URL} target="_blank" rel="noopener noreferrer" className={styles.listenLink}>
            <AppleMusicIcon /> APPLE MUSIC
          </a>
        </div>
      </section>

      <AnimatePresence>
        {open && track && (
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
                  src={track.video}
                  poster={track.poster}
                  label="[ VIDEO À VENIR ]"
                  ratio="16/9"
                  controls
                  autoPlay
                />
              </div>
              <div className={styles.modalCaption}>
                <div className={styles.modalTitle}>{track.title}</div>
                <div className={styles.modalDesc}>{track.description}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
