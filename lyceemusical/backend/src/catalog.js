// Single source of truth for what can be bought and at what price.
// The frontend only ever sends { productId, size, qty } — prices are never
// trusted from the client.
//
// `contains` drives the per-person limits (a pack counts as 1 CD + 1 t-shirt).
// Photos : il suffit de déposer les fichiers dans frontend/public/media/products/
// avec ces noms (carré, 1200×1200 conseillé). `imageBack` = 2e photo affichée
// au survol (dos du t-shirt…). Tant qu'un fichier manque, un dessin le remplace.

const TSHIRT_SIZES = ['S', 'M', 'L', 'XL'];

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
    price: 2500,
    badge: 'MEILLEURE OFFRE',
    featured: true,
    contains: { cd: 1, tshirt: 1 },
    sizes: TSHIRT_SIZES,
    includes: ['1 CD de l’EP « Lycée Musical » — 6 titres, dont le bonus « Les mots doux »', '1 T-shirt officiel Lycée Musical — blanc'],
    description: 'Le CD (avec son titre bonus exclusif) et le t-shirt officiel blanc Lycée Musical.',
    tagline: 'Le CD + le t-shirt officiel',
    image: '/media/products/pack.jpg',
    imageBack: null,
    imageAlt: 'T-shirt blanc « Lycée Musical » et CD de l’EP',
  },
  {
    id: 'tshirt',
    name: 'T-SHIRT LYCÉE MUSICAL',
    shortName: 'T-SHIRT',
    price: 2000,
    contains: { cd: 0, tshirt: 1 },
    sizes: TSHIRT_SIZES,
    includes: ['1 T-shirt officiel Lycée Musical — blanc, logo « Lycée Musical » sur le devant'],
    description: 'Le t-shirt officiel de l’EP : blanc, avec le logo « Lycée Musical » sur le devant.',
    tagline: 'T-shirt blanc officiel',
    image: '/media/products/tshirt.jpg',
    imageBack: null,
    imageAlt: 'T-shirt blanc « Lycée Musical »',
  },
];

const getProduct = (id) => PRODUCTS.find((p) => p.id === id) || null;

module.exports = { PRODUCTS, TSHIRT_SIZES, getProduct };
