import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { to: '/', label: 'HOME' },
  { to: '/store', label: 'STORE' },
  { to: '/ticket-office', label: 'TICKETS' },
  { to: '/music', label: 'MUSIC' },
  { to: '/contact', label: 'CONTACT' }
];

const InstaIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} aria-label="RBS Home">
          RBS
        </Link>

        <nav className={styles.links} aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.right}>
          <a
            href="https://instagram.com/_rbsfr"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.social}
            aria-label="Instagram"
          >
            <InstaIcon />
          </a>
          <Link to="/store" className={styles.bag} aria-label="Bag">
            BAG <span>(0)</span>
          </Link>
        </div>

        <button
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
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
                      isActive
                        ? `${styles.overlayLink} ${styles.overlayActive}`
                        : styles.overlayLink
                    }
                  >
                    <span className={styles.overlayLinkIdx}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            <div className={styles.overlaySocials}>
              <a
                href="https://instagram.com/_rbsfr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstaIcon /> <span>INSTAGRAM</span>
              </a>
              <a href="mailto:contact@rbs.fr">
                <span>CONTACT@RBS.FR</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
