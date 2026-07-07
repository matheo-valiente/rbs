import styles from './LegalPage.module.css';

export default function MentionsLegales() {
  return (
    <div className={styles.page}>
      <header className={styles.headBar}>
        <div>
          <span className={styles.headLabel}>MENTIONS LÉGALES</span>
          <span className={styles.headSep}> — </span>
          <span>RBS</span>
        </div>
      </header>

      <h1 className={styles.title}>Mentions légales</h1>
      <div className={styles.updated}>Dernière mise à jour : [ DATE À COMPLÉTER ]</div>

      <div className={styles.body}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Éditeur du site</div>
          <p>
            Le site rbs.fr est édité par{' '}
            <span className={styles.placeholder}>
              [ RAISON SOCIALE / NOM DE L'ORGANISATEUR À COMPLÉTER ]
            </span>
            , <span className={styles.placeholder}>[ FORME JURIDIQUE ]</span>,
            immatriculée sous le numéro{' '}
            <span className={styles.placeholder}>[ SIRET À COMPLÉTER ]</span>,
            dont le siège social est situé{' '}
            <span className={styles.placeholder}>[ ADRESSE À COMPLÉTER ]</span>.
          </p>
          <p>
            Directeur de la publication :{' '}
            <span className={styles.placeholder}>[ NOM À COMPLÉTER ]</span>.
            Contact : <a href="mailto:contact@rbs.fr">contact@rbs.fr</a>.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Hébergement</div>
          <p>
            Le site est hébergé par{' '}
            <span className={styles.placeholder}>
              [ NOM DE L'HÉBERGEUR, ADRESSE À COMPLÉTER ]
            </span>
            .
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Paiement</div>
          <p>
            Les paiements effectués sur ce site (billetterie et boutique)
            sont traités par Stripe Payments Europe, Ltd., prestataire de
            services de paiement agréé. RBS ne stocke aucune donnée
            bancaire — voir notre{' '}
            <a href="/confidentialite">politique de confidentialité</a>.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Propriété intellectuelle</div>
          <p>
            L'ensemble des contenus présents sur ce site (textes, visuels,
            photographies, vidéos, logo) est la propriété de RBS ou de ses
            ayants droit, sauf mention contraire. Toute reproduction ou
            représentation, totale ou partielle, sans autorisation est
            interdite.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Contact</div>
          <p>
            Pour toute question relative à ces mentions légales, contactez
            RBS à <a href="mailto:contact@rbs.fr">contact@rbs.fr</a> ou via
            le <a href="/contact">formulaire de contact</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
