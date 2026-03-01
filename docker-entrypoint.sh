#!/bin/sh
# ─── ShadowDrive AI — Production Entrypoint ───
# Runs on every container start: migrate → seed → serve
set -e

echo "🔄 Running database migrations..."
node_modules/.bin/prisma migrate deploy

echo "🌱 Seeding database (safe: upsert)..."
node prisma/seed.cjs

echo "🚀 Starting Next.js..."
exec node server.js
