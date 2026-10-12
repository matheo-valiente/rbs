// Copie cohérente de la base (même pendant que le serveur tourne).
//   npm run backup   → data/backups/shop-AAAA-MM-JJTHH-MM.db
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const config = require('../src/config');

const dir = path.join(path.dirname(config.dbPath), 'backups');
fs.mkdirSync(dir, { recursive: true });
const target = path.join(dir, `shop-${new Date().toISOString().slice(0, 16).replace(/:/g, '-')}.db`);

const db = new DatabaseSync(config.dbPath);
db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
db.close();

// Keep the 60 most recent backups.
fs.readdirSync(dir)
  .filter((f) => f.startsWith('shop-') && f.endsWith('.db'))
  .sort()
  .slice(0, -60)
  .forEach((f) => fs.unlinkSync(path.join(dir, f)));

console.log(`✓ Sauvegarde : ${target}`);
