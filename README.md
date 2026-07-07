# RBS — French Rap Collective

Site complet pour RBS — collectif événementiel et marque de merch.
Frontend React (Vite) + backend Node/Express avec données JSON.

## Structure

```
rbs-website/
├── client/        # React + Vite (port 5173)
└── server/        # Express API (port 3001)
```

## Lancement

### 1. Démarrer le serveur (terminal 1)

```bash
cd server
npm install
node index.js
```

→ API disponible sur http://localhost:3001

### 2. Démarrer le client (terminal 2)

```bash
cd client
npm install
npm run dev
```

→ Site disponible sur http://localhost:5173

Vite est configuré avec un proxy `/api → http://localhost:3001`,
donc le client peut appeler `/api/...` sans CORS en dev.
CORS est aussi activé côté serveur si besoin.

## API Endpoints

| Méthode | Route            | Description                                   |
| ------- | ---------------- | --------------------------------------------- |
| GET     | `/api/products`  | Liste des produits (lus de `data/products.json`) |
| GET     | `/api/events`    | Liste des événements                          |
| GET     | `/api/tracks`    | Liste des vidéos / tracks                     |
| POST    | `/api/contact`   | Reçoit un message (loggé en console)          |

## Pages

- `/` — **Home** : hero vidéo plein écran + section présentation
- `/store` — **Store** : grille de produits + modal taille / commande
- `/ticket-office` — **Ticket Office** : événements + QR code SVG
- `/music` — **Music** : carrousel horizontal auto-scroll, modal vidéo
- `/live` — **Live** : posters événements + CTA vers billetterie
- `/contact` — **Contact** : formulaire stylisé + dropdown sujet

## Ajouter du contenu réel

Aucun build à refaire. Toutes les données sont dans `server/data/*.json` :

```json
// server/data/products.json — ajouter un champ image (URL ou /assets/img.jpg)
{ "id": 1, "name": "RBS HOODIE", "price": "65€", "category": "TOPS", "image": "/img/hoodie.jpg" }

// server/data/tracks.json — ajouter une URL vidéo
{ "id": 1, "title": "RBS — SESSION 01", "video": "/videos/session-01.mp4" }
```

Pour la **vidéo de fond hero**, remplacer le `<VideoPlaceholder>` du
composant `client/src/pages/Home.jsx` par :

```jsx
<video src="/videos/hero.mp4" autoPlay muted loop playsInline className="..." />
```

## Stack

- **Frontend** : React 18, Vite, React Router v6, Framer Motion, CSS Modules
- **Backend** : Node.js, Express 4, CORS, dotenv
- **Fonts** : Bebas Neue, Barlow Condensed, IBM Plex Mono, Space Mono (Google Fonts)
- **Couleurs** : noir `#000000`, blanc `#ffffff`, rouge `#ff1111`

## Production

```bash
cd client
npm run build      # output dans client/dist/
```

Servir `client/dist/` derrière le serveur Express en production
(par exemple via `app.use(express.static('../client/dist'))`).
