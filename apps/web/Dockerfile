FROM node:20-alpine AS build
WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/tsconfig.json apps/web/vite.config.ts ./apps/web/
COPY apps/server/package.json ./apps/server/

RUN pnpm install --frozen-lockfile
COPY . .

ARG API_BASE_URL=/api
ENV VITE_API_BASE_URL=${API_BASE_URL}
RUN pnpm --filter web build

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
