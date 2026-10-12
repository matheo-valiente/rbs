import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';
import { ARTIST, EP_TITLE, LINKS, CONTACT_EMAIL } from '../config.js';
import { InstaIcon } from './Icons.jsx';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { to: '/', label: 'ACCUEIL' },
  { to: '/boutique', label: 'BOUTIQUE' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const cart = useCart();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (location.pathname.startsWith('/admin')) return null;

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} aria-label={`${ARTIST} — accueil`}>
          <span className={styles.logoMain}>{ARTIST}</span>
          <span className={styles.logoSub}>{EP_TITLE}</span>
        </Link>

        <nav className={styles.links} aria-label="Navigation principale">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.right}>
          {LINKS.instagram && (
            <a
              href={LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.social}
              aria-label="Instagram"
            >
              <InstaIcon />
            </a>
          )}
          <button type="button" className={styles.bag} onClick={cart.open} aria-label="Ouvrir le panier">
            PANIER <span>({cart.itemCount})</span>
          </button>
          <button
            className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.overlay}
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav className={styles.overlayLinks}>
              {NAV_LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      isActive ? `${styles.overlayLink} ${styles.overlayActive}` : styles.overlayLink
                    }
                  >
                    <span className={styles.overlayLinkIdx}>{String(i + 1).padStart(2, '0')}</span>
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            <div className={styles.overlaySocials}>
              {LINKS.instagram && (
                <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">
                  <InstaIcon /> <span>INSTAGRAM</span>
                </a>
              )}
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <span>{CONTACT_EMAIL.toUpperCase()}</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
