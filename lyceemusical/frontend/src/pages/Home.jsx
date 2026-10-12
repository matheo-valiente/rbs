import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext.jsx';
import Countdown from '../components/Countdown.jsx';
import MediaImage from '../components/MediaImage.jsx';
import ProductVisual from '../components/ProductVisual.jsx';
import StreamingLinks from '../components/StreamingLinks.jsx';
import { ARTIST, EP_TITLE, LINKS, INSTAGRAM_HANDLE, MEDIA, BIO, TRACKLIST, HOME } from '../config.js';
import { euros, parisDate } from '../lib/format.js';
import styles from './Home.module.css';

const MARQUEE = ['PRÉCOMMANDE', EP_TITLE, 'CD', 'T-SHIRT', 'PACK CD + T-SHIRT', ARTIST];

function PreorderLine() {
  const { shop, phase, offset } = useShop();
  if (!shop) return null;
  if (phase === 'upcoming') {
    return (
      <div className={styles.heroStatus}>
        <span className={styles.heroStatusLabel}>PRÉCOMMANDES DANS</span>
        <Countdown target={shop.preorder.opensAt} offset={offset} />
      </div>
    );
  }
  if (phase === 'open') {
    return (
      <div className={styles.heroStatus}>
        <span className={styles.dot} />
        <span className={styles.heroStatusLabel}>
          PRÉCOMMANDES OUVERTES — JUSQU’AU {parisDate(shop.preorder.closesAt).toUpperCase()}
        </span>
      </div>
    );
  }
  return (
    <div className={styles.heroStatus}>
      <span className={styles.heroStatusLabel}>PRÉCOMMANDES TERMINÉES — MERCI</span>
    </div>
  );
}

export default function Home() {
  const { products, phase } = useShop();

  return (
    <div className={styles.page}>
      <section className={styles.videoHero}>
        <video
          className={styles.videoHeroMedia}
          src={MEDIA.heroVideo}
          poster={MEDIA.heroPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className={styles.videoHeroOverlay} />

        <div className={styles.heroContent}>
          <span className={styles.kicker}>NOUVEL EP — {ARTIST}</span>
          <h1 className={styles.heroTitle}>{EP_TITLE}</h1>
          <PreorderLine />
          <div className={styles.heroCtas}>
            <Link to="/boutique" className={styles.ctaPrimary}>
              {phase === 'closed' ? 'VOIR LA BOUTIQUE' : 'PRÉCOMMANDER'} →
            </Link>
            {LINKS.ep && (
              <a href={LINKS.ep} target="_blank" rel="noopener noreferrer" className={styles.ctaSecondary}>
                ÉCOUTER L’EP ↗
              </a>
            )}
          </div>
        </div>

        <div className={styles.videoHeroFoot}>
          <span>{ARTIST} — {EP_TITLE}</span>
          <span>LYCEEMUSICAL.COM</span>
        </div>
      </section>

      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {[0, 1].map((k) => (
            <span key={k}>
              {Array.from({ length: 3 })
                .flatMap(() => MARQUEE)
                .map((w, i) => (
                  <span key={i}>
                    {w}
                    <i>✦</i>
                  </span>
                ))}
            </span>
          ))}
        </div>
      </div>

      <section className={styles.presentation}>
        <div className={styles.presentationInner}>
          <div className={styles.presentationMedia}>
            <MediaImage src={MEDIA.portrait} alt={ARTIST} className={styles.fill} />
          </div>
          <div className={styles.presentationBody}>
            <div className={styles.presentationIndex}>01 / {ARTIST}</div>
            <h2 className={styles.presentationTitle}>{HOME.bioTitle}</h2>
            {BIO.map((p, i) => (
              <p key={i} className={styles.presentationText}>
                {p}
              </p>
            ))}
            {LINKS.instagram && (
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className={styles.presentationLink}>
                SUIVRE {INSTAGRAM_HANDLE} ↗
              </a>
            )}
          </div>
        </div>
      </section>

      <section className={styles.presentation2}>
        <div className={styles.presentation2Inner}>
          <div className={styles.presentationBody}>
            <div className={styles.presentationIndex}>02 / L’EP</div>
            <h2 className={styles.presentationTitle}>{EP_TITLE}</h2>
            <p className={styles.presentationText}>{HOME.epText}</p>
            {TRACKLIST.length > 0 && (
              <ol className={styles.tracklist}>
                {TRACKLIST.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
            )}
            <StreamingLinks only={['spotify', 'deezer', 'appleMusic', 'ep']} />
          </div>
          <div className={styles.presentationMedia}>
            <MediaImage src={MEDIA.cover} alt={`Pochette — ${EP_TITLE}`} label="[ POCHETTE À VENIR ]" className={styles.fill} />
          </div>
        </div>
      </section>

      <section className={styles.offers}>
        <div className={styles.offersHead}>
          <div className={styles.presentationIndex}>03 / PRÉCOMMANDE</div>
          <h2 className={styles.presentationTitle}>{HOME.offersTitle}</h2>
        </div>
        <div className={styles.offersGrid}>
          {products.map((p) => (
            <Link key={p.id} to="/boutique" className={`${styles.offer} ${p.featured ? styles.offerFeatured : ''} product-hover`}>
              {p.badge && <span className={styles.offerBadge}>{p.badge}</span>}
              <ProductVisual product={p} />
              <div className={styles.offerRow}>
                <span className={styles.offerName}>{p.name}</span>
                <span className={styles.offerPrice}>
                  {p.compareAtPrice && <s>{euros(p.compareAtPrice)}</s>} {euros(p.price)}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className={styles.offersCta}>
          <Link to="/boutique" className={styles.ctaDark}>
            ACCÉDER À LA BOUTIQUE →
          </Link>
        </div>
      </section>
    </div>
  );
}
