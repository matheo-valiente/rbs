// ⚑ INFORMATIONS LÉGALES DU VENDEUR — le compte Stripe qui encaisse est celui de LUVBFK.
// Utilisées partout : pages Mentions légales / CGV / Confidentialité,
// pied de facture Stripe, emails clients.

// Tout champ laissé vide ('') est simplement masqué (site, emails, factures).
module.exports = {
  legalName: 'LUVBFK',
  legalForm: '',
  capital: '',
  address: '',
  rcs: '',
  siret: '',
  vatNumber: '',
  publisher: '',

  // 'normal' = prix TTC, TVA 20 % incluse · 'franchise' = « TVA non applicable, art. 293 B du CGI »
  vatRegime: 'franchise',

  contactEmail: 'rbs18event@gmail.com',

  // Médiateur de la consommation (ex. CM2C, Medicys) — masqué tant que vide.
  mediator: { name: '', url: '' },

  returnAddress: '', // adresse de retour des colis
};
