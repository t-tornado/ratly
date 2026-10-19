FROM node:22-alpine AS builder
WORKDIR /workspace

RUN corepack enable

# Copy manifests first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY apps/ui/package.json ./apps/ui/

RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/core ./packages/core
COPY apps/ui ./apps/ui

# Build core first (ui depends on @ratly/core)
RUN pnpm --filter @ratly/core build

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @ratly/ui build

FROM nginx:alpine AS prod

COPY --from=builder /workspace/apps/ui/dist /usr/share/nginx/html
COPY apps/ui/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
