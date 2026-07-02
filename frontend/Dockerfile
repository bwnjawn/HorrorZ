
FROM node:24-alpine AS build-stage

RUN npm install -g pnpm@10.33.3

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile

COPY frontend/ ./frontend/

WORKDIR /app/frontend

RUN pnpm run build


FROM nginx:1.30-alpine AS production-stage

COPY --from=build-stage /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]