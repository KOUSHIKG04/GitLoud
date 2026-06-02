FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json turbo.json ./

COPY apps/api/package.json apps/api/package.json
COPY packages packages

RUN npm ci --no-audit --no-fund

COPY apps/api apps/api

RUN npm --workspace api run build


FROM node:22-slim AS runner

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/apps/api/package.json apps/api/package.json

EXPOSE 4000

CMD ["node", "apps/api/dist/index.js"]
