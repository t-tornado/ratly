FROM node:22-alpine AS builder
WORKDIR /workspace

RUN corepack enable

# Copy manifests first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY apps/server/package.json ./apps/server/

RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/core ./packages/core
COPY apps/server ./apps/server

# Build core first (server depends on @ratly/core dist)
RUN pnpm --filter @ratly/core build
RUN pnpm --filter @ratly/server build

# Deploy prod deps (includes @ratly/core with its built dist)
RUN pnpm --filter @ratly/server deploy --prod /deploy

FROM node:22-alpine AS prod
WORKDIR /app

COPY --from=builder /deploy/node_modules ./node_modules
COPY --from=builder /workspace/apps/server/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
