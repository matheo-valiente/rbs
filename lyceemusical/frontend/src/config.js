// Contenu éditorial et liens — tout ce qui change souvent est ici.
// Un lien vide ('') s'affiche comme « BIENTÔT » (pratique avant la sortie).

export const ARTIST = 'LUVBFK';
export const EP_TITLE = 'LYCÉE MUSICAL';

export const LINKS = {
  instagram: 'https://instagram.com/luvbfk',
  ep: '', // smartlink / lien de l'EP (ex. Linkfire, Feature.fm…) — vide = « BIENTÔT »
  spotify: 'https://open.spotify.com/artist/7CjPQNkFoIlmPCPawTQtcn',
  deezer: 'https://www.deezer.com/fr/artist/169045347',
  appleMusic: 'https://music.apple.com/fr/artist/luvbfk/1614527802'
};

export const INSTAGRAM_HANDLE = '@LUVBFK';
export const CONTACT_EMAIL = 'rbs18event@gmail.com';

export const MEDIA = {
  heroVideo: '/media/video/hero.mp4',
  heroVideoMobile: '/media/video/hero-mobile.mp4', // version allégée pour téléphone
  heroPoster: '/media/video/hero-poster.jpg',
  portrait: '/media/photos/luvbfk-marchons.jpg', // image du clip « Marchons » (changer le nom du fichier à chaque nouvelle photo, sinon les navigateurs gardent l'ancienne 1 h)
  portraitCaption: 'Extrait du clip « Marchons » feat. Darlingchouchou',
  portraitLink: 'https://www.youtube.com/watch?v=Qa_qU1QawZM',
  coverFront: '/media/photos/cover-front.jpg', // recto de la pochette (carré)
  coverBack: '/media/photos/cover-back.jpg' // verso (tracklist + crédits)
};

// Textes de l'accueil — courts et directs.
export const HOME = {
  bioTitle: '18e arrondissement.',
  epTagline: '6 titres enregistrés par un groupe de 7 musiciens.',
  offersTitle: 'Le CD, le t-shirt, ou les deux.'
};

export const BIO = [
  'Chanteur et rappeur parisien, LUVBFK développe un univers à la croisée du rap et des sonorités alternatives. Actif depuis plusieurs années, il a sorti plusieurs projets dont HATEBFK et WHAT???.',
  'Son univers l’a progressivement amené sur différentes scènes parisiennes, avec notamment un concert à La Boule Noire en décembre 2025, ainsi que des passages dans les studios de Planète Rap. En 2026, il poursuit son développement scénique avec une première partie annoncée pour Yvnnis au Bataclan le 5 novembre, ou encore une programmation au Grunt Festival le 31 octobre.'
];

// Texte de la section EP (un élément = un paragraphe)
export const EP_TEXT = [
  'À la croisée du jazz contemporain et des nouvelles sonorités de la scène urbaine française, ce projet réunit LUVBFK, chanteur et rappeur, Williamarker2021, producteur et arrangeur, et un sextet de jeunes musiciens issus de la scène jazz parisienne.',
  'L’ambition est de créer un univers musical qui fusionne les propositions des artistes dès l’écriture et la conception des morceaux.',
  'Composé de six titres originaux, la musique est portée par un sextet acoustique composé d’une trompette, d’un saxophone alto, d’un Rhodes, d’une guitare, d’une basse et d’une batterie. Aucun sample, aucune programmation ni instrument virtuel : les morceaux sont construits autour du jeu des musiciens et de leurs interactions avec le chanteur.'
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

// Crédits (verso de la pochette)
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
  // Mettre les vraies mesures (cm) : le guide s'affiche alors automatiquement dans la boutique.
  { size: 'S', chest: '—', length: '—' },
  { size: 'M', chest: '—', length: '—' },
  { size: 'L', chest: '—', length: '—' },
  { size: 'XL', chest: '—', length: '—' },
  { size: 'XXL', chest: '—', length: '—' }
];
