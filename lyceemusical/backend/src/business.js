// ⚑ INFORMATIONS LÉGALES DU VENDEUR — à remplir UNE fois.
// Utilisées partout : pages Mentions légales / CGV / Confidentialité,
// pied de facture Stripe, emails clients.
// (Les infos exactes sont sur le Kbis de RBS SAS / l'avis de situation SIRENE.)

module.exports = {
  legalName: 'RBS SAS',
  legalForm: 'Société par actions simplifiée (SAS)',
  capital: '[CAPITAL] €', // ex. '1 000 €'
  address: '[ADRESSE DU SIÈGE], [CP] [VILLE], France',
  rcs: 'RCS [VILLE] [N°]', // ex. 'RCS Paris 912 345 678'
  siret: '[SIRET]', // 14 chiffres
  vatNumber: '[FR XX XXXXXXXXX]', // laisser '' si franchise en base de TVA
  publisher: '[NOM DU PRÉSIDENT / DIRECTEUR DE LA PUBLICATION]',

  // Régime de TVA :
  //  - 'normal'    : prix TTC, TVA 20 % incluse et détaillée sur les factures
  //                  (mettre aussi VAT_RATE=20 et lancer `npm run stripe:setup`)
  //  - 'franchise' : micro/franchise en base → « TVA non applicable, art. 293 B du CGI »
  vatRegime: 'normal',

  contactEmail: 'contact@lyceemusical.com',

  // Médiateur de la consommation (obligatoire pour vendre à des particuliers).
  // Adhésion en ligne à quelques dizaines d'€/an, ex. CM2C, Medicys, CNPM.
  mediator: {
    name: '[NOM DU MÉDIATEUR]',
    url: '[https://site-du-mediateur.fr]',
  },

  // Expédition
  carrier: '[Colissimo / Mondial Relay / La Poste Lettre suivie]',
  returnAddress: '[ADRESSE DE RETOUR SI DIFFÉRENTE DU SIÈGE]',
};
