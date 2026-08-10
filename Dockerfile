# Docker image for Coolify. Built in three stages so the final image only carries what it needs
# to run: no build tools, no dev dependencies, no source files.

# --- Stage 1: install dependencies -------------------------------------------------------------
# Kept separate so Docker can reuse this layer whenever package.json has not changed.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# `npm ci` installs the exact versions in package-lock.json, so a build here matches your machine.
RUN npm ci

# --- Stage 2: build ----------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Stage 3: run ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run as a non-root user. If the container is ever compromised it cannot write outside its own files.
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# standalone does not include public/ or .next/static, so they are copied in by hand.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
# 0.0.0.0 rather than localhost, otherwise the server only accepts traffic from inside the container
# and Coolify's proxy cannot reach it.
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
