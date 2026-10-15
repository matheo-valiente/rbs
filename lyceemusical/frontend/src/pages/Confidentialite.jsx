import { useBusiness } from '../components/LegalField.jsx';
import { CONTACT_EMAIL } from '../config.js';
import styles from './LegalPage.module.css';

export default function Confidentialite() {
  const b = useBusiness();
  return (
    <div className={styles.page}>
      <header className={styles.headBar}>
        <div>
          <span className={styles.headLabel}>CONFIDENTIALITÉ</span>
          <span className={styles.headSep}> — </span>
          <span>LYCÉE MUSICAL</span>
        </div>
      </header>

      <h1 className={styles.title}>Politique de confidentialité</h1>

      <div className={styles.body}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>01 — Données collectées</div>
          <p>
            Responsable du traitement : {b?.legalName || 'LUVBFK'}.{' '}
            Lors d’une commande : nom, adresse email, adresse de livraison, numéro de téléphone et contenu de la
            commande. Les données de carte bancaire sont saisies directement chez Stripe et ne nous sont jamais
            communiquées.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>02 — Finalités</div>
          <p>
            Ces données servent uniquement à traiter, expédier et assurer le suivi des commandes (base légale :
            exécution du contrat), et à respecter nos obligations comptables. Aucune donnée n’est vendue ni
            utilisée à des fins publicitaires.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>03 — Destinataires et durée</div>
          <p>
            Destinataires : l’équipe Lycée Musical ({b?.legalName || 'LUVBFK'}), Stripe (paiement), le service de livraison et notre
            prestataire d’envoi d’emails. Les données de commande sont conservées 3 ans après la commande, puis
            archivées pendant la durée légale comptable (10 ans) pour les seules pièces justificatives.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>04 — Cookies</div>
          <p>
            Le site n’utilise aucun cookie publicitaire ni outil de mesure d’audience. Seul le stockage local de
            ton navigateur est utilisé pour mémoriser ton panier.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>05 — Tes droits</div>
          <p>
            Tu disposes d’un droit d’accès, de rectification, d’effacement et d’opposition sur tes données en
            écrivant à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Tu peux aussi introduire une
            réclamation auprès de la CNIL (www.cnil.fr).
          </p>
        </div>
      </div>
    </div>
  );
}
