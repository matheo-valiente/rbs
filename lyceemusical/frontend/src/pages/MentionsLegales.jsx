import { useBusiness } from '../components/LegalField.jsx';
import { CONTACT_EMAIL } from '../config.js';
import styles from './LegalPage.module.css';

export default function MentionsLegales() {
  const b = useBusiness();
  if (!b) return <div className={styles.page} />;
  return (
    <div className={styles.page}>
      <header className={styles.headBar}>
        <div>
          <span className={styles.headLabel}>MENTIONS LÉGALES</span>
          <span className={styles.headSep}> — </span>
          <span>LYCÉE MUSICAL</span>
        </div>
      </header>

      <h1 className={styles.title}>Mentions légales</h1>

      <div className={styles.body}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>01 — Éditeur du site</div>
          <p>
            <strong>{b.legalName}</strong>
            {b.capital && ` — capital de ${b.capital}`}
            <br />
            {b.address && (
              <>
                Siège : {b.address}
                <br />
              </>
            )}
            {(b.rcs || b.siret) && (
              <>
                {[b.rcs, b.siret && `SIRET ${b.siret}`].filter(Boolean).join(' — ')}
                <br />
              </>
            )}
            {b.vatNumber && (
              <>
                TVA intracommunautaire : {b.vatNumber}
                <br />
              </>
            )}
            {b.publisher && (
              <>
                Directeur de la publication : {b.publisher}
                <br />
              </>
            )}
            Contact : <a href={`mailto:${b.contactEmail || CONTACT_EMAIL}`}>{b.contactEmail || CONTACT_EMAIL}</a>
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>02 — Hébergement</div>
          <p>OVH SAS — 2 rue Kellermann, 59100 Roubaix, France — www.ovhcloud.com</p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>03 — Paiement</div>
          <p>
            Les paiements sont traités par Stripe Payments Europe Ltd., 1 Grand Canal Street Lower, Dublin 2, Irlande.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>04 — Propriété intellectuelle</div>
          <p>
            L’ensemble des contenus du site (musique, visuels, vidéos, textes, logos) est la propriété de Luvbfk et de
            leurs ayants droit. Toute reproduction sans autorisation est interdite.
          </p>
        </div>
      </div>
    </div>
  );
}
