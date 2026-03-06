#!/bin/sh
# ─── ShadowDrive AI — Production Entrypoint ───
# Runs on every container start: migrate → seed → serve
set -e

echo "🔄 Running database migrations..."
node_modules/.bin/prisma migrate deploy || echo "⚠️  Migration failed, skipping (app will start anyway)..."

echo "🌱 Seeding database (safe: upsert)..."
node prisma/seed.cjs || echo "⚠️  Seed failed, skipping (app will start anyway)..."

echo "🚀 Starting Next.js..."
exec node_modules/.bin/next start --port "${PORT:-3000}"
