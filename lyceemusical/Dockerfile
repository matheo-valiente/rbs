# --- 1. Build du frontend ---
FROM node:24-alpine AS web
WORKDIR /web
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# --- 2. Serveur (API + fichiers statiques) ---
FROM node:24-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY backend/ .
COPY --from=web /web/dist /app/frontend/dist

# Unprivileged user; /app/data is the mounted volume holding the SQLite DB.
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node

ENV NODE_ENV=production \
    PORT=3001 \
    DB_PATH=/app/data/shop.db
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/health || exit 1

CMD ["node", "--disable-warning=ExperimentalWarning", "src/server.js"]
