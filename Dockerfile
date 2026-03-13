# ─── ShadowDrive Frontend Dockerfile ───
# Multi-stage build for Next.js (workspace-aware)

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --ignore-scripts -w frontend -w backend -w @shadowdrive/shared

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (schema lives in backend/prisma/)
RUN cd frontend && npx prisma generate

# Compile seed.ts → seed.cjs (bundles course data, no tsx required at runtime)
RUN node_modules/.bin/esbuild backend/prisma/seed.ts \
    --bundle \
    --platform=node \
    --outfile=backend/prisma/seed.cjs \
    --external:@prisma/client

RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.js standalone build output
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

# Prisma schema + migrations + compiled seed
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/backend/prisma ./backend/prisma

# Install Prisma natively in the runner stage to avoid missing dependency errors
RUN npm install prisma@6.19.2 @prisma/client@6.19.2 --no-save
# Startup script: migrate → seed → start
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./docker-entrypoint.sh"]
