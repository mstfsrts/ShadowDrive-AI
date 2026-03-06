# ─── ShadowDrive Frontend Dockerfile ───
# Multi-stage build for Next.js (non-standalone mode)

# Stage 1: Install dependencies
# --ignore-scripts skips postinstall (prisma generate would fail without schema)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (schema.prisma is now available)
RUN node_modules/.bin/prisma generate

# Compile seed.ts → seed.cjs (bundles course data, no tsx required at runtime)
# esbuild is available via Next.js devDependencies
RUN node_modules/.bin/esbuild prisma/seed.ts \
    --bundle \
    --platform=node \
    --outfile=prisma/seed.cjs \
    --external:@prisma/client

RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.js build output (non-standalone: full .next directory)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# All node_modules from builder (includes Prisma CLI, Next.js CLI, prisma client)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# package.json needed for npm scripts resolution
COPY --from=builder /app/package.json ./package.json

# Prisma schema + migrations + compiled seed
COPY --from=builder /app/prisma ./prisma

# Startup script: migrate → seed → start
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./docker-entrypoint.sh"]
