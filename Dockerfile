# ==============================================================================
# Hardened Multi-Stage Dockerfile for Robot Fleet Black Box
# Standar CIS Docker Benchmark & Non-Root Least Privilege
# ==============================================================================

# ─── Stage 1: Base Alpine Image ───────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production

# ─── Stage 2: Dependencies ───────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ─── Stage 3: Builder ────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Stage 4: Production Hardened Runner ──────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 1. Kontrol Hardening: Buat pengguna dan grup non-root khusus (UID/GID 1001)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 2. Salin aset publik dan artefak build Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 3. Kontrol Hardening: Tetapkan kepemilikan dan beralih ke user non-root
USER nextjs

# 4. Port internal container (hanya di-expose untuk reverse proxy / internal docker network)
EXPOSE 3000

CMD ["node", "server.js"]
