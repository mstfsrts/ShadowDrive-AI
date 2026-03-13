#!/bin/sh
# ─── ShadowDrive AI — Production Entrypoint ───
# Runs on every container start: wait for DB → migrate → seed → serve

# Next.js standalone mode does not pack npx/.bin symlinks properly.
# We must use the exact local binary path that we copied in the Dockerfile.
PRISMA_CLI="node ../node_modules/prisma/build/index.js"
SCHEMA_FLAG="--schema=./prisma/schema.prisma"

echo "--- Waiting for database connection..."
MAX_RETRIES=10
RETRY=0
cd backend
while [ $RETRY -lt $MAX_RETRIES ]; do
    if echo "SELECT 1" | $PRISMA_CLI db execute --stdin $SCHEMA_FLAG > /dev/null 2>&1; then
        echo "--- Database connected"
        break
    fi
    RETRY=$((RETRY + 1))
    echo "--- DB not ready, retry $RETRY/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY -eq $MAX_RETRIES ]; then
    echo "--- WARNING: Database not reachable after $MAX_RETRIES retries, starting without migration..."
else
    # ─── Step 1: Diagnose and fix migration state ───
    # Problem: If previous deploys ran migrate deploy without baselining,
    # the _prisma_migrations table may contain FAILED entries (tables already
    # existed from prisma db push). Failed entries block all future migrate deploy.
    echo "--- Checking migration state..."
    node -e "
      const {PrismaClient}=require('@prisma/client');
      const p=new PrismaClient();
      (async()=>{
        try {
          // Check if _prisma_migrations table exists
          const tables = await p.\$queryRawUnsafe(
            \"SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename='_prisma_migrations'\"
          );
          if (tables.length === 0) {
            console.log('STATE:NO_TABLE');
            await p.\$disconnect();
            return;
          }

          // Get all migration entries
          const rows = await p.\$queryRawUnsafe(
            'SELECT migration_name, finished_at, rolled_back_at, logs FROM _prisma_migrations ORDER BY started_at'
          );
          console.log('STATE:TABLE_EXISTS');
          console.log('ENTRIES:' + rows.length);
          for (const r of rows) {
            const status = r.rolled_back_at ? 'ROLLED_BACK'
              : r.finished_at ? 'APPLIED'
              : 'FAILED';
            console.log('MIGRATION:' + r.migration_name + ':' + status);
            if (r.logs) console.log('LOGS:' + r.logs.substring(0, 200));
          }

          // Delete failed/rolled-back entries (they block migrate deploy)
          const deleted = await p.\$executeRawUnsafe(
            'DELETE FROM _prisma_migrations WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL'
          );
          if (deleted > 0) {
            console.log('CLEANED:' + deleted);
          }

          // Count remaining successfully applied entries
          const result = await p.\$queryRawUnsafe(
            'SELECT COUNT(*)::int as c FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL'
          );
          console.log('APPLIED_COUNT:' + result[0].c);
        } catch(e) {
          console.log('STATE:ERROR');
          console.log('ERROR_MSG:' + e.message);
        }
        await p.\$disconnect();
      })();
    " 2>&1 | tee /tmp/migration_check.log

    STATE=$(grep '^STATE:' /tmp/migration_check.log | head -1 | cut -d: -f2)
    APPLIED_COUNT=$(grep '^APPLIED_COUNT:' /tmp/migration_check.log | head -1 | cut -d: -f2)
    CLEANED=$(grep '^CLEANED:' /tmp/migration_check.log | head -1 | cut -d: -f2)

    [ -n "$CLEANED" ] && echo "--- Cleaned $CLEANED failed/rolled-back migration entries"

    # ─── Step 2: Baseline if needed ───
    # These 4 migrations were already applied via prisma db push (tables exist).
    # We mark them as "applied" so migrate deploy skips them and only runs new ones.
    NEED_BASELINE="false"
    if [ "$STATE" = "NO_TABLE" ]; then
        echo "--- No _prisma_migrations table — need baselining"
        NEED_BASELINE="true"
    elif [ "$STATE" = "ERROR" ]; then
        echo "--- WARNING: Could not check migration state, attempting migrate deploy anyway..."
    elif [ "$APPLIED_COUNT" = "0" ] || [ -z "$APPLIED_COUNT" ]; then
        echo "--- No successfully applied migrations found — need baselining"
        NEED_BASELINE="true"
    else
        echo "--- Found $APPLIED_COUNT applied migrations"
    fi

    if [ "$NEED_BASELINE" = "true" ]; then
        echo "--- Baselining 4 existing migrations..."
        $PRISMA_CLI migrate resolve --applied 20260301000000_init $SCHEMA_FLAG 2>&1
        $PRISMA_CLI migrate resolve --applied 20260301120000_add_courses_lessons_progress $SCHEMA_FLAG 2>&1
        $PRISMA_CLI migrate resolve --applied 20260301130000_add_course_categories $SCHEMA_FLAG 2>&1
        $PRISMA_CLI migrate resolve --applied 20260306000000_add_reset_token_fields $SCHEMA_FLAG 2>&1
        echo "--- Baseline complete — 4 existing migrations marked as applied"
    fi

    # ─── Step 3: Run pending migrations ───
    echo "--- Running prisma migrate deploy..."
    if $PRISMA_CLI migrate deploy $SCHEMA_FLAG 2>&1; then
        echo "--- Migrations applied successfully"
    else
        echo "--- WARNING: migrate deploy returned non-zero exit code (see output above)"
    fi
fi
cd /app

echo "--- Seeding database (safe: upsert)..."
node backend/prisma/seed.cjs || echo "--- WARNING: Seed failed, skipping..."

echo "--- Starting Next.js (Standalone Mode)..."
exec node frontend/server.js
