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

      <section className={styles.presentation}>
        <div className={styles.presentationInner}>
          <div className={styles.presentationMedia}>
            <img src="/media/photos/live-02.jpg" alt="RBS collectif" />
          </div>
          <div className={styles.presentationBody}>
            <div className={styles.presentationIndex}>01 / RBS</div>
            <h2 className={styles.presentationTitle}>
              Un collectif. Une scène. Une nuit.
            </h2>
            <p className={styles.presentationText}>
              RBS réunit artistes, DJs et organisateurs autour d'une seule
              scène : la nuit parisienne. Des salles aux rues, on produit
              les soirées, on sort la musique, on habille ceux qui la
              vivent.
            </p>
            <Link to="/contact" className={styles.presentationLink}>
              GET IN TOUCH →
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.carousel}>
        <DragCarousel
          ariaLabel="RBS featured projects"
          showHint={false}
          showControls={false}
          autoScroll
          autoScrollSpeed={1}
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
    </div>
  );
}
