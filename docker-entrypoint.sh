#!/bin/sh
# ─── ShadowDrive AI — Production Entrypoint ───
# Runs on every container start: wait for DB → migrate → seed → serve

# Next.js standalone mode does not pack npx/.bin symlinks properly.
# We must use the exact local binary path that we copied in the Dockerfile.
PRISMA_CLI="node ../node_modules/prisma/build/index.js"
SCHEMA_FLAG="--schema=./prisma/schema.prisma"

echo "⏳ Waiting for database connection..."
MAX_RETRIES=10
RETRY=0
cd backend
while [ $RETRY -lt $MAX_RETRIES ]; do
    if echo "SELECT 1" | $PRISMA_CLI db execute --stdin > /dev/null 2>&1; then
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
    echo "🔄 Checking migration baseline..."
    MIGRATION_COUNT=$(node -e "
      const {PrismaClient}=require('@prisma/client');
      const p=new PrismaClient();
      p.\$queryRawUnsafe('SELECT COUNT(*)::int as c FROM _prisma_migrations')
        .then(r=>{ console.log(r[0].c); process.exit(0); })
        .catch(()=>{ console.log('0'); process.exit(0); });
    " 2>/dev/null)

    if [ "$MIGRATION_COUNT" = "0" ]; then
        echo "📋 No migration history found — baselining existing migrations..."
        $PRISMA_CLI migrate resolve --applied 20260301000000_init $SCHEMA_FLAG 2>&1 || true
        $PRISMA_CLI migrate resolve --applied 20260301120000_add_courses_lessons_progress $SCHEMA_FLAG 2>&1 || true
        $PRISMA_CLI migrate resolve --applied 20260301130000_add_course_categories $SCHEMA_FLAG 2>&1 || true
        $PRISMA_CLI migrate resolve --applied 20260306000000_add_reset_token_fields $SCHEMA_FLAG 2>&1 || true
        echo "✅ Baseline complete — 4 existing migrations marked as applied"
    else
        echo "✅ Migration history found ($MIGRATION_COUNT entries)"
    fi

    echo "🔄 Running database migrations..."
    if ! $PRISMA_CLI migrate deploy $SCHEMA_FLAG 2>&1; then
        echo "⚠️  Migration failed (see error above), continuing..."
    fi
fi
cd /app

echo "🌱 Seeding database (safe: upsert)..."
node backend/prisma/seed.cjs || echo "⚠️  Seed failed, skipping..."

echo "🚀 Starting Next.js (Standalone Mode)..."
exec node frontend/server.js
