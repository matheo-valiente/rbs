# Médias

- `video/hero.mp4` — vidéo plein écran de la page d'accueil (remplacer par la vraie, garder le nom).
  Conseil : MP4 H.264, 1080p max, < 15 Mo, sans son (elle est muette en autoplay).
  `ffmpeg -i source.mov -vf scale=-2:1080 -c:v libx264 -crf 26 -preset slow -an -movflags +faststart hero.mp4`
- `video/hero-poster.jpg` — image affichée pendant le chargement de la vidéo.
- `photos/luvbfk.jpg` — portrait (section « Luvbfk » de l'accueil), format 4:5.
- `photos/cover.jpg` — pochette de l'EP, format carré.
- `products/*.jpg` — photos produits (carré 1:1), puis renseigner `image` dans
  `backend/src/catalog.js` (ex. `"/media/products/tshirt.jpg"`).
- `og.jpg` — image de partage réseaux sociaux (1200×630).
