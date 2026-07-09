FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Run as an unprivileged user (node:20-alpine ships a "node" user/group)
# instead of root, in case a dependency vuln ever turns into code exec.
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "index.js"]
