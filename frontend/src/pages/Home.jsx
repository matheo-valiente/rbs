import { Link } from 'react-router-dom';
import styles from './Home.module.css';

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
              RBS réunit artistes, DJs et organisateurs autour d'une seule
              scène : la nuit parisienne. Des salles aux rues, on produit
              les soirées, on sort la musique, on habille ceux qui la
              RBS réunit artistes, DJs et organisateurs autour d'une seule
            
            </p>
            <Link to="/contact" className={styles.presentationLink}>
              GET IN TOUCH →
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.presentation2}>
        <div className={styles.presentation2Inner}>
          <div className={styles.presentationBody}>
            <div className={styles.presentationIndex}>02 / LIVE</div>
            <h2 className={styles.presentationTitle}>
              La nuit ne s'arrête jamais.
            </h2>
            <p className={styles.presentationText}>
              Entre les salles parisiennes et les block-parties
              improvisées, RBS pousse le son là où il doit être entendu.
              Line-up choisi, son maîtrisé, énergie brute à chaque
              soirée.
            </p>
            <Link to="/ticket-office" className={styles.presentationLink}>
              VOIR LES ÉVÉNEMENTS →
            </Link>
          </div>
          <div className={styles.presentationMedia}>
            <img src="/media/photos/live-08.jpg" alt="RBS live" />
          </div>
        </div>
      </section>
    </div>
  );
}
