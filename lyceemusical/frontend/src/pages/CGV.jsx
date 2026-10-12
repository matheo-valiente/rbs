import { useShop } from '../context/ShopContext.jsx';
import LegalField, { useBusiness } from '../components/LegalField.jsx';
import { CONTACT_EMAIL } from '../config.js';
import { euros } from '../lib/format.js';
import styles from './LegalPage.module.css';

export default function CGV() {
  const b = useBusiness();
  const { shop } = useShop();
  if (!b) return <div className={styles.page} />;
  const mail = <a href={`mailto:${b.contactEmail || CONTACT_EMAIL}`}>{b.contactEmail || CONTACT_EMAIL}</a>;

  return (
    <div className={styles.page}>
      <header className={styles.headBar}>
        <div>
          <span className={styles.headLabel}>CGV</span>
          <span className={styles.headSep}> — </span>
          <span>LYCÉE MUSICAL — {b.legalName}</span>
        </div>
      </header>

      <h1 className={styles.title}>Conditions générales de vente</h1>
      <div className={styles.updated}>Dernière mise à jour : [ DATE À COMPLÉTER ]</div>

      <div className={styles.body}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>01 — Vendeur</div>
          <p>
            Les ventes réalisées sur ce site sont conclues avec <strong>{b.legalName}</strong>,{' '}
            {b.legalForm} au capital de <LegalField value={b.capital} />, dont le siège est situé{' '}
            <LegalField value={b.address} />, immatriculée au <LegalField value={b.rcs} /> (SIRET{' '}
            <LegalField value={b.siret} />), ci-après « le Vendeur ». Contact : {mail}.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>02 — Produits et précommande</div>
          <p>
            Les produits proposés (CD de l’EP « Lycée Musical », t-shirt officiel, pack CD + t-shirt) sont vendus
            en précommande, pendant une période limitée indiquée sur le site. Les articles sont fabriqués et/ou
            expédiés après la clôture de la période de précommande. Le nombre d’articles est limité à 3 CD et
            3 t-shirts par personne (les packs comptant pour 1 CD et 1 t-shirt). Le Vendeur se réserve le droit
            d’annuler et de rembourser toute commande ne respectant pas cette limite.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>03 — Prix et paiement</div>
          <p>
            Les prix sont indiqués en euros,{' '}
            {b.vatRegime === 'franchise' ? 'TVA non applicable (art. 293 B du CGI)' : 'toutes taxes comprises (TVA incluse)'}.
            Une facture est émise pour chaque commande et envoyée par email.
            Les frais de livraison sont indiqués avant la validation du paiement. Le paiement est exigible
            immédiatement à la commande et sécurisé par Stripe (carte bancaire, Apple Pay, Google Pay). Le Vendeur
            n’a jamais accès à vos données bancaires.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>04 — Livraison</div>
          <p>
            Les commandes sont livrées à l’adresse indiquée lors du paiement
            {shop ? ` (pays : ${shop.shipping.countries.join(', ')})` : ''}. Frais de livraison :{' '}
            {shop ? (shop.shipping.feeCents ? `${euros(shop.shipping.feeCents)} par commande` : 'offerts') : '—'}.{' '}
            <LegalField value={shop?.preorder.shippingEstimate || '[DATE D’EXPÉDITION À COMPLÉTER]'} />. Transporteur :{' '}
            <LegalField value={b.carrier} />. En cas de retard, le client
            en est informé par email. À défaut de livraison dans un délai de 30 jours après la date annoncée, le
            client peut résoudre la vente et obtenir le remboursement intégral (art. L216-6 du Code de la
            consommation).
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>05 — Droit de rétractation</div>
          <p>
            Conformément à l’article L221-18 du Code de la consommation, le client dispose d’un délai de 14 jours
            à compter de la réception des articles pour exercer son droit de rétractation, sans avoir à justifier
            de motif, en écrivant à {mail}. Les articles doivent être retournés dans leur état d’origine à
            l’adresse <LegalField value={b.returnAddress && !b.returnAddress.includes('[') ? b.returnAddress : b.address} /> ;
            les frais de retour sont à la charge du client. Les CD
            descellés ne peuvent être repris (art. L221-28 9°). Le remboursement intervient sous 14 jours après
            réception du retour, par le même moyen de paiement.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>06 — Annulation avant expédition</div>
          <p>
            Toute demande d’annulation ou de changement de taille avant la clôture des précommandes peut être
            adressée à {mail} en indiquant le numéro de commande
            (LM-XXXX). Elle donne lieu à un remboursement intégral.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>07 — Garanties et litiges</div>
          <p>
            Les produits bénéficient de la garantie légale de conformité (art. L217-3 et s. du Code de la
            consommation) et de la garantie des vices cachés (art. 1641 et s. du Code civil). En cas de litige, le
            client peut recourir gratuitement au médiateur de la consommation : <LegalField value={b.mediator.name} />{' '}
            (<LegalField value={b.mediator.url} />), ainsi qu’à la plateforme européenne de règlement en ligne des
            litiges. Les présentes CGV sont
            soumises au droit français.
          </p>
        </div>
      </div>
    </div>
  );
}
