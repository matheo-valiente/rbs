import styles from './LegalPage.module.css';

export default function CGV() {
  return (
    <div className={styles.page}>
      <header className={styles.headBar}>
        <div>
          <span className={styles.headLabel}>CGV</span>
          <span className={styles.headSep}> — </span>
          <span>RBS</span>
        </div>
      </header>

      <h1 className={styles.title}>Conditions générales de vente</h1>
      <div className={styles.updated}>Dernière mise à jour : [ DATE À COMPLÉTER ]</div>

      <div className={styles.body}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>01 — Objet</div>
          <p>
            Les présentes conditions générales de vente régissent les
            ventes de billets d'accès aux événements RBS ainsi que les
            ventes d'articles de la boutique RBS (vêtements et
            accessoires), réalisées sur ce site.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>02 — Prix et paiement</div>
          <p>
            Les prix sont indiqués en euros, toutes taxes comprises. Le
            paiement est exigible immédiatement à la commande et sécurisé
            par Stripe. RBS ne conserve aucune donnée de carte bancaire.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>03 — Billetterie</div>
          <p>
            Chaque billet acheté donne accès à un événement RBS à la date
            et au lieu indiqués lors de l'achat. Le billet est
            nominatif et non remboursable, sauf annulation de
            l'événement par l'organisateur. En cas d'annulation, les
            billets sont remboursés ou reportés selon les modalités
            communiquées aux acheteurs par email.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>04 — Boutique &amp; livraison</div>
          <p>
            Les articles de la boutique sont expédiés à l'adresse
            indiquée lors de la commande. Les délais et frais de
            livraison sont précisés avant la confirmation du paiement.{' '}
            <span className={styles.placeholder}>
              [ DÉLAIS ET ZONES DE LIVRAISON À COMPLÉTER ]
            </span>
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>05 — Droit de rétractation</div>
          <p>
            Conformément à l'article L221-28 du Code de la consommation,
            le droit de rétractation ne s'applique pas aux prestations de
            services de loisirs (billetterie d'événements) fournies à une
            date déterminée. Pour les articles de la boutique, le client
            dispose d'un délai de 14 jours à compter de la réception pour
            exercer son droit de rétractation, sauf article personnalisé
            ou descellé.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>06 — Contact</div>
          <p>
            Pour toute question relative à une commande, contactez RBS à{' '}
            <a href="mailto:contact@rbs.fr">contact@rbs.fr</a> ou via le{' '}
            <a href="/contact">formulaire de contact</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
