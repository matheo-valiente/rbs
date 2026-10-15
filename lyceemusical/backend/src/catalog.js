// Single source of truth for what can be bought and at what price.
// The frontend only ever sends { productId, size, qty } — prices are never
// trusted from the client.
//
// `contains` drives the per-person limits (a pack counts as 1 CD + 1 t-shirt).
// Photos : il suffit de déposer les fichiers dans frontend/public/media/products/
// avec ces noms (carré, 1200×1200 conseillé). `imageBack` = 2e photo affichée
// au survol (dos du t-shirt…). Tant qu'un fichier manque, un dessin le remplace.
// `teaser` = t-shirt pas encore dévoilé : affiche le visuel « surprise » à la
// place de la photo. Le jour de la révélation, supprimer la ligne `teaser`.

// `revealAt` = fin du chrono affiché sur l'image (heure de Paris).
const TSHIRT_TEASER = {
  title: 'T-SHIRT SURPRISE',
  reveal: 'DÉVOILÉ CE DIMANCHE',
  revealAt: '2026-10-18T00:00:00+02:00',
  priceNote: 'avant dimanche', // affiché sous le prix barré
};

const TSHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const PRODUCTS = [
  {
    id: 'cd',
    name: 'CD — LYCÉE MUSICAL',
    shortName: 'CD',
    price: 1000,
    contains: { cd: 1, tshirt: 0 },
    sizes: null,
    includes: ['1 CD de l’EP « Lycée Musical » — 6 titres', 'Titre bonus « Les mots doux », exclusif au CD'],
    description: 'L’EP en version physique, avec « Les mots doux » : le titre bonus que vous n’entendrez que sur le CD.',
    tagline: '6 titres + 1 bonus exclusif au CD',
    image: '/media/products/cd.jpg',
    imageBack: '/media/products/cd-2.jpg',
    imageAlt: null,
  },
  {
    id: 'pack',
    name: 'PACK CD + T-SHIRT',
    shortName: 'PACK',
    price: 2000,
    compareAtPrice: 2500,
    badge: 'MEILLEURE OFFRE',
    featured: true,
    contains: { cd: 1, tshirt: 1 },
    sizes: TSHIRT_SIZES,
    includes: ['1 CD de l’EP « Lycée Musical » — 6 titres, dont le bonus « Les mots doux »', '1 T-shirt officiel Lycée Musical (dévoilé ce dimanche)'],
    description: 'Le CD (avec son titre bonus exclusif) et le t-shirt surprise, dévoilé ce dimanche. Prix réduit pour ceux qui précommandent avant.',
    tagline: 'Le CD + le t-shirt surprise',
    teaser: TSHIRT_TEASER,
    image: '/media/products/pack.jpg',
    imageBack: '/media/products/pack-2.jpg',
    imageAlt: null,
  },
  {
    id: 'tshirt',
    name: 'T-SHIRT LYCÉE MUSICAL',
    shortName: 'T-SHIRT',
    price: 1500,
    compareAtPrice: 2000,
    contains: { cd: 0, tshirt: 1 },
    sizes: TSHIRT_SIZES,
    includes: ['1 T-shirt officiel Lycée Musical (dévoilé ce dimanche)'],
    description: 'Le t-shirt officiel de l’EP, dévoilé ce dimanche. Prix réduit pour ceux qui précommandent avant.',
    tagline: 'Dévoilé ce dimanche',
    teaser: TSHIRT_TEASER,
    image: '/media/products/tshirt.jpg',
    imageBack: '/media/products/tshirt-2.jpg',
    imageAlt: null,
  },
];

const getProduct = (id) => PRODUCTS.find((p) => p.id === id) || null;

module.exports = { PRODUCTS, TSHIRT_SIZES, getProduct };
