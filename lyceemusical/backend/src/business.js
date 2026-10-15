// ⚑ INFORMATIONS LÉGALES DU VENDEUR — à remplir UNE fois.
// Utilisées partout : pages Mentions légales / CGV / Confidentialité,
// pied de facture Stripe, emails clients.
// (Les infos exactes sont sur le Kbis de RBS SAS / l'avis de situation SIRENE.)

// Tout champ laissé vide ('') est simplement masqué (site, emails, factures).
module.exports = {
  legalName: 'RBS SAS',
  legalForm: 'SAS',
  capital: '', // ex. '1 000 €'
  address: '', // ex. '12 rue X, 75018 Paris'
  rcs: '', // ex. 'RCS Paris 912 345 678'
  siret: '',
  vatNumber: '', // ex. 'FR12345678901'
  publisher: '', // directeur de la publication

  // 'normal' = prix TTC, TVA 20 % incluse · 'franchise' = « TVA non applicable, art. 293 B du CGI »
  vatRegime: 'normal',

  contactEmail: 'rbs18event@gmail.com',

  // Médiateur de la consommation (ex. CM2C, Medicys) — masqué tant que vide.
  mediator: { name: '', url: '' },

  carrier: '', // ex. 'Colissimo'
  returnAddress: '', // adresse de retour des colis
};
