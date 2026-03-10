#!/bin/sh
# ─── ShadowDrive AI — Production Entrypoint ───
# Runs on every container start: wait for DB → migrate → seed → serve

echo "⏳ Waiting for database connection..."
MAX_RETRIES=10
RETRY=0
cd backend
while [ $RETRY -lt $MAX_RETRIES ]; do
    if npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
        echo "✅ Database connected"
        break
    fi
    RETRY=$((RETRY + 1))
    echo "⏳ DB not ready, retry $RETRY/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY -eq $MAX_RETRIES ]; then
    echo "⚠️  Database not reachable after $MAX_RETRIES retries, starting without migration..."
else
    echo "🔄 Running database migrations..."
    if ! npx prisma migrate deploy 2>&1; then
        echo "⚠️  Migration failed (see error above), continuing..."
    fi
fi
cd /app

echo "🌱 Seeding database (safe: upsert)..."
node backend/prisma/seed.cjs || echo "⚠️  Seed failed, skipping..."

echo "🚀 Starting Next.js (Standalone Mode)..."
exec node frontend/server.js
