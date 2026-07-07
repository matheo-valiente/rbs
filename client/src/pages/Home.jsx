import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DragCarousel from '../components/DragCarousel.jsx';
import styles from './Home.module.css';

const FEATURED = [
  { id: 1, title: 'CROWD ENERGY', credit: 'PARIS', kind: 'LIVE', image: '/media/photos/live-07.jpg' },
  { id: 5, title: 'STREET SESSION', credit: 'PARIS', kind: 'LIVE', image: '/media/photos/live-06.jpg' },
  { id: 3, title: 'ON STAGE', credit: 'PARIS', kind: 'LIVE', image: '/media/photos/live-03.jpg' },
  { id: 4, title: 'MIC CHECK', credit: 'PARIS', kind: 'LIVE', image: '/media/photos/live-05.jpg' },
  { id: 2, title: 'CROWD SURF', credit: 'PARIS', kind: 'LIVE', image: '/media/photos/live-01.jpg' }
];

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.videoHero}>
        <video
          className={styles.videoHeroMedia}
          src="/media/video/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className={styles.videoHeroOverlay} />
        <div className={styles.videoHeroFoot}>
          <span>RBS — LIVE FOOTAGE</span>
          <span>PARIS · FR</span>
        </div>
      </section>

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
          <span>2024 — 2026</span>
          <span>PARIS · FR</span>
        </div>
      </section>

      <section className={styles.carousel}>
        <DragCarousel
          ariaLabel="RBS featured projects"
          showHint={false}
          autoScroll
        >
          {FEATURED.map((p, i) => (
            <article key={p.id} data-card className={styles.card}>
              <div className={styles.cardIndex}>
                {String(i + 1).padStart(2, '0')} / {String(FEATURED.length).padStart(2, '0')}
              </div>
              <div className={styles.cardMedia}>
                <img src={p.image} alt={p.title} className={styles.cardImg} />
                <div className={styles.cardKind}>{p.kind}</div>
              </div>
              <div className={styles.cardCaption}>
                <h2 className={styles.cardTitle}>
                  {p.title}{' '}
                  <span className={styles.cardCreditFor}>FOR</span>{' '}
                  <span className={styles.cardCredit}>@{p.credit}</span>
                </h2>
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
    </div>
  );
}
