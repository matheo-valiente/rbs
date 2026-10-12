import { useShop } from '../context/ShopContext.jsx';
import styles from '../pages/LegalPage.module.css';

// Seller details come from backend/src/business.js (served by /api/shop),
// so the legal pages, invoices and emails always say the same thing.
export const useBusiness = () => useShop().shop?.business || null;

// Renders a business field, in red while it still holds a [PLACEHOLDER].
export default function LegalField({ value }) {
  if (value == null || value === '') return null;
  return String(value).includes('[') ? <span className={styles.placeholder}>{value}</span> : <>{value}</>;
}
