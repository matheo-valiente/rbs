# Lycée Musical — Luvbfk

> Repo : `github.com/matheo-valiente/rbs`, dossier `lyceemusical/`.
> L'ancien site RBS reste récupérable : `git checkout rbs-ancien-site`.

Site de sortie de l'EP **« Lycée Musical »** de Luvbfk + boutique de précommande
(CD, t-shirt, pack), vendue et facturée par **RBS SAS**. Même DA que le site RBS.

---

## ✅ Ce qu'il reste à ajouter (tout le reste est prêt)

| Quoi | Où | Comment |
| --- | --- | --- |
| Vidéo d'accueil | `frontend/public/media/video/hero.mp4` | remplacer le fichier (garder le nom) |
| Photos produits | `frontend/public/media/products/` | `cd.jpg`, `tshirt.jpg`, `pack.jpg` (+ `cd-2.jpg`, `tshirt-2.jpg`, `pack-2.jpg` = 2ᵉ photo au survol). Carré 1200×1200 |
| Pochette recto / verso | `frontend/public/media/photos/` | `cover-front.jpg`, `cover-back.jpg` (carré) — ✓ en place |
| Image de partage | `frontend/public/media/og.jpg` | 1200×630 (aperçu Insta/WhatsApp/iMessage) |
| Textes, bio, liens | `frontend/src/config.js` | Spotify, Deezer, Apple Music, lien EP, Instagram, bio, accroche, tracklist, guide des tailles |
| Descriptions produits | `backend/src/catalog.js` | `includes` / `description` (les prix sont aussi là) |
| Infos légales RBS SAS | `backend/src/business.js` | capital, adresse, RCS, SIRET, TVA, président, médiateur, transporteur — **un seul fichier**, repris partout (CGV, mentions, factures, emails) |
| Réglages | `backend/.env` | domaine, clés Stripe, dates, frais de port, emails des responsables, SMTP |

Il n'y a rien d'autre à toucher dans le code. Une photo absente est remplacée
automatiquement par un dessin, et un lien vide s'affiche « BIENTÔT ».

**Pour voir ce qui manque à tout moment : `cd backend && npm run check`.** Cette
commande vérifie Stripe, le webhook, la TVA, les emails, le DNS, les infos légales,
les photos et les textes.

---

## Paiement : ce qui est en place

- **Stripe Checkout** : la page de paiement est hébergée par Stripe, avec 3D Secure,
  CB, Apple Pay et Google Pay. Aucune donnée bancaire ne passe par notre serveur.
- La page Stripe est **habillée Lycée Musical** (nom, police Inconsolata, bouton
  rouge), même si le compte Stripe est celui de RBS.
- Le **relevé bancaire** du client affiche « RBS* LYCEE MUSICAL ». C'est moins de
  « je ne reconnais pas ce paiement », donc moins de litiges.
- **Facture PDF numérotée au nom de RBS SAS** pour chaque commande, envoyée au client
  et rangée dans Stripe pour la compta. La TVA 20 % est incluse et détaillée (ou la
  mention art. 293 B si franchise).
- Les **prix sont recalculés côté serveur** : impossible de les modifier depuis le
  navigateur.
- **Limites 3 CD / 3 t-shirts par email**, toutes commandes confondues, y compris les
  paiements en cours.
- Seul **Stripe peut valider une commande**, via un webhook signé. La page « merci »
  ne prouve rien.
- **Rattrapage automatique** : si un webhook se perd (serveur redémarré…), le serveur
  interroge Stripe toutes les 5 min et à l'arrivée du client sur la page de
  confirmation. Aucune commande payée ne peut rester « en attente ».
- **Contrôles** à chaque paiement : montant attendu = montant payé, limite respectée,
  mode test/live. Toute anomalie est signalée en rouge dans l'email et dans `/admin`.
- **Remboursement** fait depuis Stripe : la commande passe « remboursée » et sort des
  totaux de production.
- **Litige bancaire** : alerte immédiate aux responsables, avec le lien Stripe pour y
  répondre.
- **Compte Stripe partagé avec le site RBS** : les deux sites ignorent les paiements
  de l'autre (filtrage par `metadata.site`).
- **Mode test impossible à rater** : bandeau jaune sur le site et dans l'admin tant
  que la clé est `sk_test_`.
- Sécurité serveur : en-têtes de sécurité (CSP, HSTS…), limitation du nombre de
  requêtes, conteneur non-root, admin protégé par mot de passe, sauvegardes de la base.

## Quand une commande est passée

1. **Les 2 responsables** reçoivent un email : n°, articles, tailles, nom, adresse,
   téléphone. En option : un message Telegram, et la notification de l'**app Stripe**
   sur leur téléphone.
2. **Le client** reçoit sa confirmation (récap + date d'expédition) et sa facture.
3. Sur **`lyceemusical.com/admin`** : la liste à expédier, le **total de t-shirts par
   taille** (à commander chez le fournisseur), le nombre de CD et l'export **CSV**
   (Excel) pour les étiquettes.
4. Au moment de l'envoi : « Marquer expédiée », puis coller le n° ou le lien de suivi.
   Le client reçoit automatiquement l'email « ta commande est en route ».

---

## Stripe : mise en place (RBS SAS)

**Un seul compte Stripe, au nom de RBS SAS.** Pas de compte personnel.

1. Le **président de RBS SAS** crée le compte sur https://dashboard.stripe.com/register.
   S'il existe déjà pour le site RBS, on le réutilise.
   Il faut : le SIREN, le Kbis, la pièce d'identité du président, l'**IBAN de RBS SAS**,
   et l'adresse du site.
2. **Paramètres → Équipe** : inviter chaque associé avec **son propre email**
   (rôle *Administrateur* pour ceux qui gèrent, *Support* pour ceux qui voient les
   commandes et remboursent). Pas de mot de passe partagé. Activer la **double
   authentification** pour tout le monde.
3. Chacun installe l'**app Stripe** (iOS/Android) et active les notifications
   « paiements réussis » et « litiges ».
4. **Paramètres → Paiements → Libellé de relevé** : `RBS` (le site ajoute
   « LYCEE MUSICAL »).
5. **Paramètres → Emails clients** : activer « Paiements réussis » et « Remboursements ».
6. **Paramètres → Radar** : laisser les règles par défaut (anti-fraude, 3D Secure
   quand nécessaire).
7. Récupérer la clé **Développeurs → Clés API → Clé secrète** (`sk_test_…` d'abord),
   la mettre dans `backend/.env`, puis :
   ```bash
   cd backend && npm run stripe:setup
   ```
   Ce script crée le taux de TVA et le webhook, puis affiche les lignes à copier dans
   `.env`.
8. Le jour J, mettre la clé **`sk_live_…`** et **relancer `npm run stripe:setup`**.
   Le mode live a son propre webhook et son propre taux de TVA.

> TVA : si RBS SAS est assujettie (cas normal d'une SAS), `VAT_RATE=20` et
> `vatRegime: 'normal'`. Les prix affichés (10 / 20 / 25 €) sont TTC et ne changent
> pas. En franchise en base : `VAT_RATE=0` et `vatRegime: 'franchise'`. À confirmer
> avec le comptable de RBS.

---

## Mise en ligne sur le VPS OVH

### 1. DNS (manager OVH → Domaines → lyceemusical.com → Zone DNS)

| Type | Sous-domaine | Cible |
| --- | --- | --- |
| A | *(vide)* | IP du VPS |
| A | www | IP du VPS |

### 2. Emails (Brevo, gratuit jusqu'à 300 emails/jour)

Créer un compte sur https://www.brevo.com, puis **Expéditeurs & domaines → ajouter
lyceemusical.com**. Brevo donne des enregistrements DNS (SPF, DKIM, DMARC) à ajouter
dans la même zone DNS OVH : **sans eux, les emails finissent en spam**. Mettre ensuite
les identifiants SMTP dans `backend/.env`.

### 3. Serveur

```bash
ssh ubuntu@IP_DU_VPS
git clone https://github.com/matheo-valiente/rbs.git
cd rbs/lyceemusical
bash deploy/setup-vps.sh          # Docker, pare-feu, fail2ban, mises à jour auto
exit                              # puis se reconnecter

cd rbs/lyceemusical
cp backend/.env.example backend/.env && nano backend/.env
#   DOMAIN=lyceemusical.com   PUBLIC_URL=https://lyceemusical.com
#   STRIPE_SECRET_KEY, ADMIN_PASSWORD (openssl rand -base64 24), NOTIFY_EMAILS, SMTP_*
./deploy/deploy.sh                # build + HTTPS automatique + vérification
docker compose exec app npm run stripe:setup   # webhook + TVA → copier dans .env
./deploy/deploy.sh                # relance avec le secret du webhook
crontab -e                        # sauvegardes : voir deploy/backup-cron.sh
```

**Mettre à jour** (photos, textes, vidéo) : `git push` depuis ton ordi, puis
`./deploy/deploy.sh` sur le VPS. La base est sauvegardée avant chaque mise à jour et
les commandes ne sont jamais touchées.

**Surveillance (conseillé, gratuit)** : sur https://uptimerobot.com, une sonde sur
`https://lyceemusical.com/api/health`. Vous recevez un email/SMS si le site tombe.

### 4. Avant l'ouverture

- [ ] `docker compose exec app npm run check` → aucun ✗
- [ ] `docker compose exec app npm run test-notify` → les 2 responsables reçoivent l'email
- [ ] En mode test : commande complète avec la carte `4242 4242 4242 4242` → emails,
      facture, `/admin` OK, puis remboursement depuis Stripe → statut « remboursée »
- [ ] Passage en `sk_live_` + `npm run stripe:setup` + `./deploy/deploy.sh`
- [ ] Une vraie commande à 10 € avec une vraie carte, puis la rembourser
- [ ] Le bandeau jaune « MODE TEST » a disparu

---

## Développement local

```bash
cd backend && cp .env.example .env && npm install && npm run dev     # API :3001
stripe listen --forward-to localhost:3001/api/webhook               # copier whsec_ dans .env
cd frontend && npm install && npm run dev                            # site :5173
```

Pour tester avant l'ouverture : `PREORDER_OPENS_AT=2026-01-01T00:00:00+01:00` dans
`.env`.

## Structure

```
backend/src/
  business.js     ⚑ infos légales RBS SAS
  catalog.js      ⚑ produits, prix, photos
  config.js       lecture du .env
  routes/shop.js  catalogue + création du paiement Stripe
  routes/webhook.js  confirmations Stripe (paiement, remboursement, litige)
  fulfillment.js  logique commande payée + rattrapage automatique
  routes/admin.js back-office + CSV
  notify.js       emails / Telegram
  db.js           SQLite (data/shop.db)
backend/scripts/  check, stripe-setup, test-notify, backup
frontend/src/config.js  ⚑ textes, liens, médias
frontend/public/media/  ⚑ vidéo, photos
deploy/           Caddyfile (HTTPS), setup-vps.sh, deploy.sh, backup-cron.sh
```
