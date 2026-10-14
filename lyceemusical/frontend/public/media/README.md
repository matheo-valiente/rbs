# Médias

- `video/hero.mp4` — vidéo plein écran de la page d'accueil (720p, ~12 Mo) et `video/hero-mobile.mp4`
  (480p, ~4 Mo, servie aux téléphones). Les originaux sont dans `Documents/rbs/lyceemusical-medias-originaux/`.
  Conseil : MP4 H.264, 1080p max, < 15 Mo, sans son (elle est muette en autoplay).
  `ffmpeg -i source.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -movflags +faststart hero.mp4`
  `ffmpeg -i source.mp4 -an -vf scale=854:-2 -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart hero-mobile.mp4`
- `video/hero-poster.jpg` — image affichée pendant le chargement de la vidéo.
- `photos/cover-front.jpg` — recto de la pochette (carré), section EP de l'accueil.
- `photos/cover-back.jpg` — verso de la pochette (carré), affiché quand on retourne la pochette.
- `products/*.jpg` — photos produits (`cd.jpg` = recto, `cd-2.jpg` = verso, déjà en place) (carré 1:1), puis renseigner `image` dans
  `backend/src/catalog.js` (ex. `"/media/products/tshirt.jpg"`).
- `og.jpg` — image de partage réseaux sociaux (1200×630).
