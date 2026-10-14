// Contenu éditorial et liens — tout ce qui change souvent est ici.
// Un lien vide ('') s'affiche comme « BIENTÔT » (pratique avant la sortie).

export const ARTIST = 'LUVBFK';
export const EP_TITLE = 'LYCÉE MUSICAL';

export const LINKS = {
  instagram: 'https://instagram.com/luvbfk', // [À VÉRIFIER]
  ep: '', // smartlink / lien de l'EP (ex. Linkfire, Feature.fm…)
  spotify: '',
  deezer: '',
  appleMusic: ''
};

export const INSTAGRAM_HANDLE = '@LUVBFK'; // [À VÉRIFIER]
export const CONTACT_EMAIL = 'contact@lyceemusical.com';

export const MEDIA = {
  heroVideo: '/media/video/hero.mp4',
  heroVideoMobile: '/media/video/hero-mobile.mp4', // version allégée pour téléphone
  heroPoster: '/media/video/hero-poster.jpg',
  portrait: '/media/photos/luvbfk.jpg',
  cover: '/media/photos/cover.jpg' // verso de la pochette (tracklist + crédits)
};

// Textes de l'accueil
export const HOME = {
  bioTitle: '[ACCROCHE À COMPLÉTER — ex. « Du lycée au studio. »]',
  epText: '6 titres portés par un vrai groupe : rhodes, sax, trompette, basse, batterie, guitare. Disponible sur toutes les plateformes [DATE DE SORTIE À COMPLÉTER] — et en CD, avec un titre bonus qu’on ne trouve nulle part ailleurs.',
  offersTitle: 'Le CD, le t-shirt, ou les deux.'
};

export const BIO = [
  '[BIO À COMPLÉTER] — Luvbfk, artiste [ville]. Quelques lignes sur son parcours, son univers et ce qui l’a amené à Lycée Musical.',
  '[PARAGRAPHE 2 À COMPLÉTER] — L’histoire de l’EP : où il a été enregistré, avec qui, ce qu’il raconte.'
];

// Tracklist (recopiée du verso de la pochette) — laisser vide pour masquer.
// `cdOnly: true` affiche le badge « EXCLU CD ».
export const EP_DURATION = '19’26”';

export const TRACKLIST = [
  { title: 'MARCHONS', feat: 'DARLINGCHOUCHOU', credits: 'Prod & arr. Williamarker2021 & Luvbfk' },
  { title: 'ASSURANCE DU CŒUR', credits: 'Prod & arr. Luvbfk, Soavecamour & Williamarker2021' },
  { title: 'P*TAIN DE $', credits: 'Prod & arr. Luvbfk & Williamarker2021' },
  { title: 'MA CHÉRIE', credits: 'Prod. Duke Jordan & arr. Williamarker2021' },
  { title: 'LES MOTS DOUX', credits: 'Prod & arr. Williamarker2021', cdOnly: true },
  { title: 'P*TAIN DE FUCKING $', credits: 'Prod & arr. Luvbfk & Williamarker2021' }
];

// Crédits (verso de la pochette) — [orthographe des noms À VÉRIFIER]
export const CREDITS = [
  ['Voix', 'Luvbfk'],
  ['Rhodes', 'Demian Nicolas-Demart'],
  ['Saxophone', 'Alexandre Visquis'],
  ['Basse', 'Joseph Lalande'],
  ['Batterie', 'Vianney Fatus'],
  ['Trompette', 'Lucien Ricard aka Williamarker2021'],
  ['Guitare', 'Ben Reuchin'],
  ['Mix & mastering', 'Eliot Veron & Adil de Saint Denis'],
  ['Enregistrement', 'Gaspard Berta'],
  ['Production exécutive', 'RBS & Williamarker2021'],
  ['DA', 'Orane Moustaid'],
  ['Cover', 'Jroockie & Her Eyez'],
  ['Graphisme', 'Jules Chery'],
  ['Management', 'Williamarker2021']
];

export const SIZE_GUIDE = [
  // [À COMPLÉTER avec les vraies mesures du fournisseur]
  { size: 'S', chest: '—', length: '—' },
  { size: 'M', chest: '—', length: '—' },
  { size: 'L', chest: '—', length: '—' },
  { size: 'XL', chest: '—', length: '—' },
  { size: 'XXL', chest: '—', length: '—' }
];
