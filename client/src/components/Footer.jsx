import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const PaymentIcon = ({ label }) => (
  <span className={styles.payChip} aria-label={label}>
    {label}
  </span>
);

const NAV_LINKS = [
  { to: '/store', label: 'STORE' },
  { to: '/ticket-office', label: 'TICKETS' },
  { to: '/music', label: 'MUSIC' },
  { to: '/contact', label: 'CONTACT' }
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brandCol}>
          <div className={styles.brand}>RBS</div>
          <p className={styles.tagline}>
            Collectif rap — soirées, musique &amp; merch. Paris.
          </p>
          <a
            href="https://instagram.com/_rbsfr"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.igLink}
          >
            @_RBSFR ↗
          </a>
        </div>

        <nav className={styles.navCol} aria-label="Footer">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.payments}>
        <PaymentIcon label="VISA" />
        <PaymentIcon label="MASTERCARD" />
        <PaymentIcon label="AMEX" />
        <PaymentIcon label="APPLE PAY" />
      </div>

      <div className={styles.bottom}>
        <span>© {year} RBS</span>
        <span>PAIEMENT SÉCURISÉ PAR STRIPE</span>
        <span>PARIS · FR</span>
      </div>

      <div className={styles.legal}>
        <Link to="/mentions-legales">MENTIONS LÉGALES</Link>
        <Link to="/cgv">CGV</Link>
        <Link to="/confidentialite">CONFIDENTIALITÉ</Link>
      </div>
    </footer>
  );
}
