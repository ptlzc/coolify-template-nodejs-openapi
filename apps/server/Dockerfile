FROM node:20-alpine AS build
WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/tsconfig.json apps/server/tsconfig.build.json ./apps/server/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter server build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/apps/server/package.json ./apps/server/
RUN pnpm install --filter server --prod --frozen-lockfile
COPY --from=build /app/apps/server/dist ./apps/server/dist
ENV PORT=4000
EXPOSE 4000
CMD ["node", "apps/server/dist/index.js"]
