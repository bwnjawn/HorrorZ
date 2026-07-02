
FROM node:20.19.0-alpine

RUN npm install -g pnpm@10.33.3

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile

COPY backend/ ./backend/

WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "src/server.js"]