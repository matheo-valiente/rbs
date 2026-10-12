#!/usr/bin/env bash
# Installation initiale d'un VPS OVH neuf (Ubuntu 24.04), à lancer UNE fois :
#   ssh ubuntu@IP_DU_VPS
#   git clone https://github.com/matheo-valiente/rbs.git
#   bash rbs/lyceemusical/deploy/setup-vps.sh
set -euo pipefail

echo "==> Mises à jour système"
sudo apt-get update -y && sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "==> Mises à jour de sécurité automatiques"
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y unattended-upgrades fail2ban git
sudo dpkg-reconfigure -f noninteractive unattended-upgrades
sudo systemctl enable --now fail2ban

echo "==> Docker"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
fi

echo "==> Pare-feu (SSH + HTTP/HTTPS uniquement)"
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw --force enable

echo "==> Fuseau horaire"
sudo timedatectl set-timezone Europe/Paris

cat <<'MSG'

✓ VPS prêt. Étapes suivantes :
  1. se déconnecter / reconnecter (pour le groupe docker)
  2. cd rbs/lyceemusical
  3. cp backend/.env.example backend/.env && nano backend/.env
  4. ./deploy/deploy.sh
MSG
