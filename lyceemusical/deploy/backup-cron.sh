#!/bin/sh
# Sauvegarde de la base des commandes (garde les 60 dernières dans data/backups/).
# Sur le VPS : crontab -e  puis ajouter :
#   0 */6 * * * /home/ubuntu/rbs/lyceemusical/deploy/backup-cron.sh >> /home/ubuntu/backup.log 2>&1
cd "$(dirname "$0")/.." && docker compose exec -T app npm run backup
