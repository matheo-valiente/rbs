import { Link, useLocation } from 'react-router-dom';
import { ARTIST, EP_TITLE, LINKS, INSTAGRAM_HANDLE, CONTACT_EMAIL } from '../config.js';
import styles from './Footer.module.css';

const PaymentIcon = ({ label }) => (
  <span className={styles.payChip} aria-label={label}>
    {label}
  </span>
);

export default function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brandCol}>
          <div className={styles.brand}>{ARTIST}</div>
          <p className={styles.tagline}>« {EP_TITLE} » — le nouvel EP. CD &amp; t-shirt officiel en précommande.</p>
          {LINKS.instagram && (
            <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className={styles.igLink}>
              {INSTAGRAM_HANDLE} ↗
            </a>
          )}
        </div>

        <nav className={styles.navCol} aria-label="Pied de page">
          <Link to="/">ACCUEIL</Link>
          <Link to="/boutique">BOUTIQUE</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>CONTACT</a>
          <Link to="/cgv">LIVRAISON</Link>
        </nav>
      </div>

      <div className={styles.payments}>
        <PaymentIcon label="VISA" />
        <PaymentIcon label="MASTERCARD" />
        <PaymentIcon label="CB" />
        <PaymentIcon label="APPLE PAY" />
        <PaymentIcon label="GOOGLE PAY" />
      </div>

      <div className={styles.bottom}>
        <span>© {year} {ARTIST}</span>
        <span>PAIEMENT SÉCURISÉ PAR STRIPE</span>
        <span>LYCEEMUSICAL.COM</span>
      </div>

      <div className={styles.legal}>
        <Link to="/mentions-legales">MENTIONS LÉGALES</Link>
        <Link to="/cgv">CGV</Link>
        <Link to="/confidentialite">CONFIDENTIALITÉ</Link>
      </div>
    </footer>
  );
}
