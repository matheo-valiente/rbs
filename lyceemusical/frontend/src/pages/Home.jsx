import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext.jsx';
import Countdown from '../components/Countdown.jsx';
import MediaImage from '../components/MediaImage.jsx';
import ProductVisual from '../components/ProductVisual.jsx';
import StreamingLinks from '../components/StreamingLinks.jsx';
import {
  ARTIST,
  EP_TITLE,
  LINKS,
  INSTAGRAM_HANDLE,
  MEDIA,
  BIO,
  TRACKLIST,
  CREDITS,
  EP_DURATION,
  HOME
} from '../config.js';
import { euros, parisDate } from '../lib/format.js';
import styles from './Home.module.css';

const MARQUEE = ['PRÉCOMMANDE', EP_TITLE, 'CD + TITRE BONUS', 'T-SHIRT', 'PACK CD + T-SHIRT', ARTIST];

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
};

// Lighter file on phones; chosen once at mount (no layout shift, no double download).
function heroVideoSrc() {
  if (MEDIA.heroVideoMobile && typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches) {
    return MEDIA.heroVideoMobile;
  }
  return MEDIA.heroVideo;
}

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

// Front cover, flips to the back (tracklist) on click / tap.
function CoverFlip() {
  const [back, setBack] = useState(false);
  return (
    <div className={styles.cover}>
      <button
        type="button"
        className={`${styles.coverCard} ${back ? styles.coverFlipped : ''}`}
        onClick={() => setBack((b) => !b)}
        aria-label={back ? 'Voir le recto de la pochette' : 'Voir le verso de la pochette'}
      >
        <span className={`${styles.coverFace} ${styles.coverFront}`}>
          <MediaImage
            src={MEDIA.coverFront}
            alt={`Pochette — ${EP_TITLE}`}
            label="[ POCHETTE ]"
            className={styles.fill}
          />
        </span>
        <span className={`${styles.coverFace} ${styles.coverBack}`}>
          <MediaImage src={MEDIA.coverBack} alt={`Verso — ${EP_TITLE}`} label="[ VERSO ]" className={styles.fill} />
        </span>
      </button>
      <div className={styles.coverSwitch}>
        <button type="button" className={!back ? styles.coverOn : ''} onClick={() => setBack(false)}>
          RECTO
        </button>
        <button type="button" className={back ? styles.coverOn : ''} onClick={() => setBack(true)}>
          VERSO
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { products, phase } = useShop();
  const [videoSrc] = useState(heroVideoSrc);

  return (
    <div className={styles.page}>
      <section className={styles.videoHero}>
        <video
          className={styles.videoHeroMedia}
          src={videoSrc}
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
          <span>
            {ARTIST} — {EP_TITLE}
          </span>
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

      <section className={styles.artist}>
        <motion.div className={styles.artistInner} {...reveal}>
          <figure className={styles.portrait}>
            <div className={styles.portraitPhoto}>
              <MediaImage src={MEDIA.portrait} alt={ARTIST} className={styles.fill} />
            </div>
            {MEDIA.portraitCaption && (
              <figcaption>
                {MEDIA.portraitLink ? (
                  <a href={MEDIA.portraitLink} target="_blank" rel="noopener noreferrer">
                    {MEDIA.portraitCaption} ↗
                  </a>
                ) : (
                  MEDIA.portraitCaption
                )}
              </figcaption>
            )}
          </figure>
          <div className={styles.artistBody}>
            <div className={styles.sectionIndex}>
              <span>01</span> {ARTIST}
            </div>
            <h2 className={styles.artistTitle}>{HOME.bioTitle}</h2>
            {BIO.map((p, i) => (
              <p key={i} className={styles.bodyText}>
                {p}
              </p>
            ))}
            {LINKS.instagram && (
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className={styles.textLink}>
                SUIVRE {INSTAGRAM_HANDLE} ↗
              </a>
            )}
          </div>
        </motion.div>
      </section>

      <section className={styles.ep} id="ep">
        <div className={styles.epHead}>
          <div className={styles.sectionIndex}>
            <span>02</span> L’EP
          </div>
          <div className={styles.epMeta}>
            {TRACKLIST.length > 0 && <span>{TRACKLIST.length} TITRES</span>}
            {EP_DURATION && <span>{EP_DURATION}</span>}
            <span>{ARTIST}</span>
          </div>
        </div>

        <div className={styles.epInner}>
          <motion.div className={styles.epCoverWrap} {...reveal}>
            <CoverFlip />
          </motion.div>

          <motion.div className={styles.epBody} {...reveal}>
            <h2 className={styles.epTitle}>{EP_TITLE}</h2>
            <p className={styles.bodyText}>{HOME.epText}</p>

            {TRACKLIST.length > 0 && (
              <ol className={styles.tracklist}>
                {TRACKLIST.map((t, i) => (
                  <li key={t.title} className={styles.track}>
                    <span className={styles.trackNo}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.trackMain}>
                      <span className={styles.trackTitle}>
                        {t.title}
                        {t.feat && <em> feat. {t.feat}</em>}
                      </span>
                      {t.credits && <span className={styles.trackCredits}>{t.credits}</span>}
                    </span>
                    {t.cdOnly && (
                      <Link to="/boutique" className={styles.cdOnly}>
                        EXCLU CD
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            )}

            <StreamingLinks only={['spotify', 'deezer', 'appleMusic', 'ep']} dark />

            {CREDITS.length > 0 && (
              <details className={styles.credits}>
                <summary>CRÉDITS</summary>
                <dl>
                  {CREDITS.map(([role, name]) => (
                    <div key={role}>
                      <dt>{role}</dt>
                      <dd>{name}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
          </motion.div>
        </div>
      </section>

      <section className={styles.offers}>
        <div className={styles.offersHead}>
          <div className={styles.sectionIndex}>
            <span>03</span> PRÉCOMMANDE
          </div>
          <h2 className={styles.offersTitle}>{HOME.offersTitle}</h2>
        </div>
        <div className={styles.offersGrid}>
          {products.map((p) => (
            <Link
              key={p.id}
              to="/boutique"
              className={`${styles.offer} ${p.featured ? styles.offerFeatured : ''} product-hover`}
            >
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
