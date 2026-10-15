# Médias

- `video/hero-16s.mp4` (ordinateur, ~2,6 Mo) et `video/hero-16s-mobile.mp4` (téléphone, ~650 Ko) : boucle de 16 s, sans son.
  Garder une vidéo courte (10–20 s) : sur téléphone, une vidéo lourde ne se lance pas ou met longtemps.
  Changer le nom du fichier à chaque nouvelle vidéo (sinon les navigateurs gardent l'ancienne) et mettre à jour `MEDIA` dans `frontend/src/config.js`.
  `ffmpeg -ss 0 -t 16 -i source.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -movflags +faststart hero-16s.mp4`
  `ffmpeg -ss 0 -t 16 -i source.mp4 -an -vf scale=720:-2 -c:v libx264 -profile:v main -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart hero-16s-mobile.mp4`
- `video/hero-16s-poster.jpg` — image affichée pendant le chargement de la vidéo.
- `photos/cover-front.jpg` — recto de la pochette (carré), section EP de l'accueil.
- `photos/cover-back.jpg` — verso de la pochette (carré), affiché quand on retourne la pochette.
- `products/*.jpg` — photos produits (`cd.jpg` = recto, `cd-2.jpg` = verso, déjà en place) (carré 1:1), puis renseigner `image` dans
  `backend/src/catalog.js` (ex. `"/media/products/tshirt.jpg"`).
- `og.jpg` — image de partage réseaux sociaux (1200×630).
