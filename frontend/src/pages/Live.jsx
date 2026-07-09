import DragCarousel from '../components/DragCarousel.jsx';
import styles from './Live.module.css';

const POSTERS = [
  { id: 1, title: 'ZG ATTACK', image: '/media/photos/poster-zgattack.jpg' },
  { id: 2, title: 'HEXTII VOL. 2', image: '/media/photos/poster-hextii-vol2.jpg' },
  { id: 3, title: 'HEXTII — LA BELLEVILLOISE', image: '/media/photos/poster-hextii-bellevilloise.jpg' },
  { id: 4, title: 'BENIBLA EVENT', image: '/media/photos/event.jpg' }
];

const LOOP = [...POSTERS, ...POSTERS];

export default function Live() {
  return (
    <div className={styles.page}>
      <section className={styles.carousel}>
        <DragCarousel
          ariaLabel="RBS event posters"
          showHint={false}
          showControls={false}
          autoScroll
          autoScrollSpeed={1.4}
        >
          {LOOP.map((p, i) => (
            <article key={`${p.id}-${i}`} data-card className={styles.card}>
              <div className={styles.cardMedia}>
                <img src={p.image} alt={p.title} className={styles.cardImg} />
                <div className={styles.cardCaption}>{p.title}</div>
              </div>
            </article>
          ))}
        </DragCarousel>
      </section>
    </div>
  );
}
