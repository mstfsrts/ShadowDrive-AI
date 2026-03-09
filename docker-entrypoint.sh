#!/bin/sh
# ─── ShadowDrive AI — Production Entrypoint ───
# Runs on every container start: migrate → seed → serve
set -e

echo "🔄 Running database migrations..."
cd frontend && npx prisma migrate deploy || echo "⚠️  Migration failed, skipping (app will start anyway)..."
cd /app

echo "🌱 Seeding database (safe: upsert)..."
node backend/prisma/seed.cjs || echo "⚠️  Seed failed, skipping (app will start anyway)..."

echo "🚀 Starting Next.js..."
exec node_modules/.bin/next start --port "${PORT:-3000}" -H "${HOSTNAME:-0.0.0.0}" --dir frontend
