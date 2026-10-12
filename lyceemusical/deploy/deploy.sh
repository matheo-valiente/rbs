#!/usr/bin/env bash
# Déploie / met à jour le site (à lancer sur le VPS, dans le dossier du projet).
#   ./deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f backend/.env ] || { echo "✗ backend/.env manquant (cp backend/.env.example backend/.env)"; exit 1; }

echo "==> Récupération du code"
git pull --ff-only || echo "(pas de git pull — déploiement de la copie locale)"

mkdir -p data
sudo chown 1000:1000 data   # utilisateur non-root du conteneur

if [ -f data/shop.db ]; then
  echo "==> Sauvegarde de la base avant mise à jour"
  docker compose exec -T app npm run backup || true
fi

echo "==> Build + redémarrage"
docker compose up -d --build --remove-orphans
docker image prune -f >/dev/null

echo "==> Attente du démarrage"
for i in $(seq 1 30); do
  if docker compose exec -T app wget -qO- http://127.0.0.1:3001/api/health >/dev/null 2>&1; then
    echo "✓ En ligne"
    docker compose exec -T app npm run check || true
    exit 0
  fi
  sleep 2
done
echo "✗ Le site ne répond pas — logs :"
docker compose logs --tail=50 app
exit 1
