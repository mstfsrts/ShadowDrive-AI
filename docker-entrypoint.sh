#!/bin/sh
# ─── ShadowDrive AI — Production Entrypoint ───
# Runs on every container start: migrate → seed → serve
set -e

echo "🔄 Running database migrations..."
# In standalone mode, we use the backend node_modules where prisma still exists
cd backend && npx prisma migrate deploy || echo "⚠️  Migration failed, skipping (app will start anyway)..."
cd /app

echo "🌱 Seeding database (safe: upsert)..."
node backend/prisma/seed.cjs || echo "⚠️  Seed failed, skipping (app will start anyway)..."

echo "🚀 Starting Next.js (Standalone Mode)..."
exec node frontend/server.js
