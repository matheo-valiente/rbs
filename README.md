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

| Méthode | Route                    | Description                                        |
| ------- | ------------------------ | --------------------------------------------------- |
| GET     | `/api/products`          | Liste des produits (lus de `data/products.json`)     |
| GET     | `/api/events`            | Liste des événements                                |
| GET     | `/api/tracks`            | Liste des vidéos / tracks                           |
| POST    | `/api/contact`           | Reçoit un message (loggé en console)                |
| POST    | `/api/checkout/product`  | Crée une session Stripe Checkout pour un t-shirt     |
| POST    | `/api/checkout/ticket`   | Crée une session Stripe Checkout pour une place      |
| GET     | `/api/orders/:sessionId` | Statut d'une commande (pending / paid)              |
| GET     | `/api/tickets/:sessionId`| Statut d'un billet + QR code une fois payé          |
| POST    | `/api/webhook`           | Webhook Stripe — confirme les paiements             |

## Pages

- `/` — **Home** : hero vidéo plein écran + section présentation
- `/store` — **Store** : grille de produits + modal taille / commande → paiement Stripe
- `/store/success` — confirmation de commande après paiement
- `/ticket-office` — **Ticket Office** : événements → paiement Stripe
- `/tickets/success` — confirmation + QR code réel du billet après paiement
- `/music` — **Music** : carrousel horizontal auto-scroll, modal vidéo
- `/live` — **Live** : posters événements + CTA vers billetterie
- `/contact` — **Contact** : formulaire stylisé + dropdown sujet

## Paiement (Stripe)

Le paiement passe par **Stripe Checkout** (page de paiement hébergée par
Stripe — cartes, Apple Pay, Google Pay gérés automatiquement, aucune
donnée bancaire ne transite par notre serveur).

### 1. Créer le compte Stripe (à faire par l'organisateur RBS)

1. Créer un compte sur https://dashboard.stripe.com/register
2. Récupérer les clés de test : **Développeurs → Clés API**
   (`sk_test_...`)
3. Renseigner l'IBAN de l'association/entreprise pour recevoir les
   virements (Stripe reverse l'argent des ventes sur ce compte)

### 2. Configurer le serveur

```bash
cd server
cp .env.example .env
# éditer .env et renseigner STRIPE_SECRET_KEY (clé de test pour commencer)
```

### 3. Déclarer le webhook

Le webhook est ce qui confirme qu'un paiement a réellement été effectué
(sans lui, une commande reste "pending" pour toujours). En local, pour
tester :

```bash
stripe listen --forward-to localhost:3001/api/webhook
# copie le "whsec_..." affiché dans server/.env → STRIPE_WEBHOOK_SECRET
```

En production (sur le VPS), dans le Dashboard Stripe :
**Développeurs → Webhooks → Ajouter un endpoint**
→ URL : `https://votre-domaine.fr/api/webhook`
→ Événement à écouter : `checkout.session.completed`
→ copier le "Signing secret" dans `STRIPE_WEBHOOK_SECRET`

### 4. Passer en production (vraies transactions)

Une fois les tests validés, remplacer dans `.env` les clés `sk_test_...`
par les clés `sk_live_...` (après activation du compte Stripe côté
organisateur — Stripe demande des infos légales/bancaires avant
d'autoriser les paiements réels).

## Ajouter du contenu réel

Les vraies photos/vidéos/logo se déposent dans `client/public/media/`
(voir `client/public/media/README.md`) — pas besoin de recompiler,
il suffit de référencer le chemin dans les données ou les composants.

Toutes les autres données sont dans `server/data/*.json` :

```json
// server/data/products.json — ajouter un champ image (URL ou /media/photos/img.jpg)
{ "id": 1, "name": "RBS HOODIE", "price": "65€", "category": "TOPS", "image": "/media/photos/hoodie.jpg" }

// server/data/tracks.json — ajouter une URL vidéo
{ "id": 1, "title": "RBS — SESSION 01", "video": "/media/video/session-01.mp4" }
```

Pour la **vidéo de fond hero**, remplacer le `<VideoPlaceholder>` du
composant `client/src/pages/Home.jsx` par :

```jsx
<video src="/media/video/hero.mp4" autoPlay muted loop playsInline className="..." />
```

## Stack

- **Frontend** : React 18, Vite, React Router v6, Framer Motion, CSS Modules
- **Backend** : Node.js, Express 4, CORS, dotenv, Stripe, qrcode
- **Fonts** : Anton/Archivo Black (display), Inter (sans), JetBrains Mono (mono)
- **Couleurs** : noir `#000000`, blanc `#ffffff`, rouge `#ff1111`

## Déploiement (VPS OVH)

```bash
cd client && npm run build      # output dans client/dist/
```

1. Servir `client/dist/` en statique derrière Express, en ajoutant dans
   `server/index.js` :
   ```js
   app.use(express.static(path.join(__dirname, '../client/dist')));
   app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));
   ```
   (à placer après toutes les routes `/api/...`)

2. Sur le VPS, installer Node.js, cloner le repo, `npm install` dans
   `server/`, créer `server/.env` avec les vraies clés Stripe.

3. Lancer le process en continu avec **pm2** (survit aux reboots/crashs) :
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name rbs
   pm2 save && pm2 startup
   ```

4. Reverse-proxy **nginx** vers le port 3001, avec HTTPS via
   **certbot** (`certbot --nginx -d votre-domaine.fr`) — Stripe exige
   une URL HTTPS publique pour le webhook.

5. Déclarer le webhook Stripe sur `https://votre-domaine.fr/api/webhook`
   (voir section Paiement ci-dessus).
