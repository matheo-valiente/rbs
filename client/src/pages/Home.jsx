import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DragCarousel from '../components/DragCarousel.jsx';
import VideoPlaceholder from '../components/VideoPlaceholder.jsx';
import Newsletter from '../components/Newsletter.jsx';
import styles from './Home.module.css';

const FEATURED = [
  { id: 1, title: 'HEARTFUL NIGHT', credit: 'PARIS', kind: 'EVENT', year: '2025' },
  { id: 2, title: 'HOODIE VOL.1', credit: 'TEAM RBS', kind: 'DROP', year: '2025' },
  { id: 3, title: 'SESSION 01', credit: 'STUDIO', kind: 'MUSIC', year: '2025' },
  { id: 4, title: 'DROPS SESSION', credit: 'LE BAIN', kind: 'EVENT', year: '2025' },
  { id: 5, title: 'NEW YEAR ÉDITION', credit: 'PARIS', kind: 'EVENT', year: '2026' }
];

const formatDateTime = (d = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} EDT`;
};

export default function Home() {
  const [now, setNow] = useState(formatDateTime());

  useEffect(() => {
    const id = setInterval(() => setNow(formatDateTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headLeft}>
          <span className={styles.headLabel}>JOURNAL</span>
          <span className={styles.headSep}>—</span>
          <span>RBS</span>
        </div>
        <div className={styles.headCenter}>
          ALL PROJECTS · DROPS · LIVE · MUSIC
        </div>
        <div className={styles.headRight}>{now}</div>
      </header>

      <section className={styles.heroBlock}>
        <motion.h1
          className={styles.heroTitle}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>RBS</span>
          <span className={styles.heroTitleSlash}>/</span>
          <span className={styles.heroTitleAlt}>WORK</span>
        </motion.h1>
        <div className={styles.heroMeta}>
          <span>{FEATURED.length} PROJECTS</span>
          <span>2024 — 2026</span>
          <span>PARIS · FR</span>
        </div>
      </section>

      <section className={styles.carousel}>
        <DragCarousel ariaLabel="RBS featured projects" hintLabel="DRAG TO MOVE">
          {FEATURED.map((p, i) => (
            <article key={p.id} data-card className={styles.card}>
              <div className={styles.cardIndex}>
                {String(i + 1).padStart(2, '0')} / {String(FEATURED.length).padStart(2, '0')}
              </div>
              <div className={styles.cardMedia}>
                <VideoPlaceholder
                  label={`[ ${p.kind} À VENIR ]`}
                  ratio="4/5"
                  fill={false}
                />
                <div className={styles.cardKind}>{p.kind}</div>
              </div>
              <div className={styles.cardCaption}>
                <h2 className={styles.cardTitle}>
                  {p.title}{' '}
                  <span className={styles.cardCreditFor}>FOR</span>{' '}
                  <span className={styles.cardCredit}>@{p.credit}</span>
                </h2>
                <div className={styles.cardYear}>{p.year}</div>
              </div>
            </article>
          ))}
        </DragCarousel>
      </section>

      <section className={styles.about}>
        <div className={styles.aboutInner}>
          <div className={styles.aboutLeft}>
            <div className={styles.aboutIndex}>01 / ABOUT</div>
          </div>
          <div className={styles.aboutBody}>
            <h2 className={styles.aboutTitle}>
              UN COLLECTIF.
              <br />
              <span>UNE SCÈNE.</span>
              <br />
              <span className={styles.faded}>UNE NUIT.</span>
            </h2>
            <div className={styles.aboutTextCol}>
              <p className={styles.aboutText}>
                [ TEXTE DE PRÉSENTATION À VENIR ]
              </p>
              <p className={styles.aboutTextSecondary}>
                RBS — collectif rap français basé à Paris. Événements,
                musique, merch. Une marque, une scène, une nuit. Conçu
                à Paris, joué partout.
              </p>
              <Link to="/contact" className={styles.aboutLink}>
                GET IN TOUCH →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />

      <section className={styles.marqueeWrap}>
        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i}>
                RBS · DROPS · LIVE · MERCH · PARIS · MUSIC ·{' '}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
