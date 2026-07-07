import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const PaymentIcon = ({ label }) => (
  <span className={styles.payChip} aria-label={label}>
    {label}
  </span>
);

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.brandWrap}>
        <div className={styles.brand}>RBS</div>
      </div>

      <div className={styles.navRow}>
        <Link to="/store">STORE</Link>
        <Link to="/ticket-office">TICKETS</Link>
        <Link to="/music">MUSIC</Link>
        <Link to="/live">LIVE</Link>
        <Link to="/contact">CONTACT</Link>
        <a
          href="https://instagram.com/rbs"
          target="_blank"
          rel="noopener noreferrer"
        >
          INSTAGRAM
        </a>
        <a
          href="https://youtube.com/@rbs"
          target="_blank"
          rel="noopener noreferrer"
        >
          YOUTUBE
        </a>
      </div>

      <div className={styles.payments}>
        <PaymentIcon label="VISA" />
        <PaymentIcon label="MASTERCARD" />
        <PaymentIcon label="AMEX" />
        <PaymentIcon label="APPLE PAY" />
        <PaymentIcon label="PAYPAL" />
        <PaymentIcon label="STRIPE" />
      </div>

      <div className={styles.bottom}>
        <span>@RBS · {year}</span>
        <span>PARIS · FR</span>
      </div>
    </footer>
  );
}
