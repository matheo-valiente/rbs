// ⚑ INFORMATIONS LÉGALES DU VENDEUR — à remplir UNE fois.
// Utilisées partout : pages Mentions légales / CGV / Confidentialité,
// pied de facture Stripe, emails clients.
// (Les infos exactes sont sur le Kbis de RBS SAS / l'avis de situation SIRENE.)

// Tout champ laissé vide ('') est simplement masqué (site, emails, factures).
module.exports = {
  legalName: 'RBS SAS',
  legalForm: 'SAS',
  capital: '400 €',
  address: '46 B avenue Rabelais, 94120 Fontenay-sous-Bois',
  rcs: 'RCS Créteil 991 550 468',
  siret: '991 550 468 00011',
  vatNumber: 'FR43991550468',
  publisher: 'Imanol Marticorena, président', // directeur de la publication

  // 'normal' = prix TTC, TVA 20 % incluse · 'franchise' = « TVA non applicable, art. 293 B du CGI »
  vatRegime: 'normal',

  contactEmail: 'rbs18event@gmail.com',

  // Médiateur de la consommation (ex. CM2C, Medicys) — masqué tant que vide.
  mediator: { name: '', url: '' },

  returnAddress: '', // adresse de retour des colis
};
