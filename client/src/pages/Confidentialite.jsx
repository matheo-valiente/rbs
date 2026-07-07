import styles from './LegalPage.module.css';

export default function Confidentialite() {
  return (
    <div className={styles.page}>
      <header className={styles.headBar}>
        <div>
          <span className={styles.headLabel}>CONFIDENTIALITÉ</span>
          <span className={styles.headSep}> — </span>
          <span>RBS</span>
        </div>
      </header>

      <h1 className={styles.title}>Politique de confidentialité</h1>
      <div className={styles.updated}>Dernière mise à jour : [ DATE À COMPLÉTER ]</div>

      <div className={styles.body}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Données collectées</div>
          <p>
            Lors d'une commande (billet ou article boutique) ou de
            l'utilisation du formulaire de contact, RBS collecte : nom,
            prénom, adresse email, et, pour les livraisons, une adresse
            postale. Les données de paiement (carte bancaire) sont
            saisies directement sur les pages sécurisées de Stripe et ne
            transitent jamais par les serveurs de RBS.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Utilisation des données</div>
          <p>
            Ces données servent uniquement à traiter les commandes,
            envoyer les billets et confirmations, répondre aux demandes
            de contact, et informer des prochains événements si vous y
            avez consenti. Elles ne sont jamais vendues à des tiers.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Sous-traitants</div>
          <p>
            RBS fait appel à Stripe (paiement) pour traiter les
            transactions. Ces prestataires n'utilisent les données que
            pour exécuter les services demandés.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Durée de conservation</div>
          <p>
            Les données liées aux commandes sont conservées pendant la
            durée nécessaire au traitement de la commande puis
            archivées conformément aux obligations légales (comptables,
            fiscales).
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Vos droits</div>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de
            rectification, d'effacement et d'opposition sur vos données
            personnelles. Pour exercer ces droits, contactez RBS à{' '}
            <a href="mailto:contact@rbs.fr">contact@rbs.fr</a>.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Cookies</div>
          <p>
            Ce site utilise uniquement des cookies techniques nécessaires
            à son fonctionnement (panier, session). Aucun cookie
            publicitaire ou de tracking tiers n'est utilisé à ce jour.
          </p>
        </div>
      </div>
    </div>
  );
}
