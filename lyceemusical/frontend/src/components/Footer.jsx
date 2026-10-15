import { Link, useLocation } from 'react-router-dom';
import { ARTIST, LINKS, INSTAGRAM_HANDLE, CONTACT_EMAIL } from '../config.js';
import styles from './Footer.module.css';

export default function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.row}>
        <span className={styles.brand}>{ARTIST}</span>
        {LINKS.instagram && (
          <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">
            {INSTAGRAM_HANDLE} ↗
          </a>
        )}
      </div>

      <div className={`${styles.row} ${styles.legal}`}>
        <span>© {new Date().getFullYear()} {ARTIST}</span>
        <nav aria-label="Informations légales">
          <Link to="/mentions-legales">Mentions légales</Link>
          <Link to="/cgv">CGV</Link>
          <Link to="/confidentialite">Confidentialité</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
        </nav>
      </div>
    </footer>
  );
}
