#!/bin/sh
# ─── ShadowDrive AI — Production Entrypoint ───
# Runs on every container start: wait for DB → migrate → seed → serve

# Use the natively installed prisma from runner stage
PRISMA_CLI="npx prisma"
SCHEMA_FLAG="--schema=./backend/prisma/schema.prisma"

echo "--- Waiting for database connection..."
MAX_RETRIES=10
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
    if $PRISMA_CLI db execute --stdin $SCHEMA_FLAG <<EOF > /dev/null 2>&1
SELECT 1;
EOF
    then
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
    # We use the freshly installed @prisma/client to check DB state
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
        # ─── Safety: create missing tables/types before baselining ───
        echo "--- Ensuring all tables exist (IF NOT EXISTS safety)..."
        node -e "
          const {PrismaClient}=require('@prisma/client');
          const p=new PrismaClient();
          (async()=>{
            try {
              await p.\$executeRawUnsafe(\`
                DO \\\$\\\$ BEGIN
                  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
                    CREATE TYPE \"UserRole\" AS ENUM ('USER', 'ADMIN');
                  END IF;
                END \\\$\\\$;
                ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"role\" \"UserRole\" NOT NULL DEFAULT 'USER';
                CREATE TABLE IF NOT EXISTS \"PronunciationAttempt\" (
                  \"id\" TEXT NOT NULL, \"userId\" TEXT NOT NULL, \"lessonType\" TEXT NOT NULL,
                  \"lessonId\" TEXT NOT NULL, \"lessonTitle\" TEXT NOT NULL, \"lineIndex\" INTEGER NOT NULL,
                  \"targetText\" TEXT NOT NULL, \"transcript\" TEXT NOT NULL, \"score\" DOUBLE PRECISION NOT NULL,
                  \"correct\" BOOLEAN NOT NULL, \"recordingUrl\" TEXT,
                  \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  CONSTRAINT \"PronunciationAttempt_pkey\" PRIMARY KEY (\"id\")
                );
                CREATE TABLE IF NOT EXISTS \"LessonReport\" (
                  \"id\" TEXT NOT NULL, \"userId\" TEXT NOT NULL, \"lessonType\" TEXT NOT NULL,
                  \"lessonId\" TEXT NOT NULL, \"lessonTitle\" TEXT NOT NULL, \"totalLines\" INTEGER NOT NULL,
                  \"correctCount\" INTEGER NOT NULL, \"averageScore\" DOUBLE PRECISION NOT NULL,
                  \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  CONSTRAINT \"LessonReport_pkey\" PRIMARY KEY (\"id\")
                );
                CREATE TABLE IF NOT EXISTS \"DailyActivity\" (
                  \"id\" TEXT NOT NULL, \"userId\" TEXT NOT NULL, \"date\" DATE NOT NULL,
                  \"lessonsCount\" INTEGER NOT NULL DEFAULT 0, \"practiceMinutes\" INTEGER NOT NULL DEFAULT 0,
                  \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  CONSTRAINT \"DailyActivity_pkey\" PRIMARY KEY (\"id\")
                );
                CREATE TABLE IF NOT EXISTS \"UserGoal\" (
                  \"id\" TEXT NOT NULL, \"userId\" TEXT NOT NULL,
                  \"dailyTarget\" INTEGER NOT NULL DEFAULT 2, \"weeklyTarget\" INTEGER NOT NULL DEFAULT 10,
                  CONSTRAINT \"UserGoal_pkey\" PRIMARY KEY (\"id\")
                );
                CREATE INDEX IF NOT EXISTS \"PronunciationAttempt_userId_lessonId_idx\" ON \"PronunciationAttempt\"(\"userId\", \"lessonId\");
                CREATE INDEX IF NOT EXISTS \"PronunciationAttempt_userId_createdAt_idx\" ON \"PronunciationAttempt\"(\"userId\", \"createdAt\");
                CREATE INDEX IF NOT EXISTS \"LessonReport_userId_lessonId_idx\" ON \"LessonReport\"(\"userId\", \"lessonId\");
                CREATE INDEX IF NOT EXISTS \"LessonReport_userId_createdAt_idx\" ON \"LessonReport\"(\"userId\", \"createdAt\");
                CREATE UNIQUE INDEX IF NOT EXISTS \"DailyActivity_userId_date_key\" ON \"DailyActivity\"(\"userId\", \"date\");
                CREATE UNIQUE INDEX IF NOT EXISTS \"UserGoal_userId_key\" ON \"UserGoal\"(\"userId\");
                DO \\\$\\\$ BEGIN
                  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PronunciationAttempt_userId_fkey') THEN
                    ALTER TABLE \"PronunciationAttempt\" ADD CONSTRAINT \"PronunciationAttempt_userId_fkey\"
                      FOREIGN KEY (\"userId\") REFERENCES \"User\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE;
                  END IF;
                  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LessonReport_userId_fkey') THEN
                    ALTER TABLE \"LessonReport\" ADD CONSTRAINT \"LessonReport_userId_fkey\"
                      FOREIGN KEY (\"userId\") REFERENCES \"User\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE;
                  END IF;
                  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DailyActivity_userId_fkey') THEN
                    ALTER TABLE \"DailyActivity\" ADD CONSTRAINT \"DailyActivity_userId_fkey\"
                      FOREIGN KEY (\"userId\") REFERENCES \"User\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE;
                  END IF;
                  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserGoal_userId_fkey') THEN
                    ALTER TABLE \"UserGoal\" ADD CONSTRAINT \"UserGoal_userId_fkey\"
                      FOREIGN KEY (\"userId\") REFERENCES \"User\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE;
                  END IF;
                END \\\$\\\$;
              \`);
              console.log('--- Safety SQL complete: all tables ensured');
            } catch(e) {
              console.log('--- WARNING: Safety SQL error: ' + e.message);
            }
            await p.\$disconnect();
          })();
        " 2>&1

        # ─── Dynamic baselining: resolve all migration directories ───
        echo "--- Baselining all existing migrations..."
        for dir in ./backend/prisma/migrations/*/; do
            name=$(basename "$dir")
            [ "$name" = "migration_lock.toml" ] && continue
            $PRISMA_CLI migrate resolve --applied "$name" $SCHEMA_FLAG 2>&1 || true
        done
        echo "--- Baseline complete — all existing migrations marked as applied"
    fi

    # ─── Step 3: Run pending migrations ───
    echo "--- Running prisma migrate deploy..."
    if $PRISMA_CLI migrate deploy $SCHEMA_FLAG 2>&1; then
        echo "--- Migrations applied successfully"
    else
        echo "--- WARNING: migrate deploy returned non-zero exit code (see output above)"
    fi
fi

echo "--- Seeding database (safe: upsert)..."
node backend/prisma/seed.cjs || echo "--- WARNING: Seed failed, skipping..."

echo "--- Starting Next.js (Standalone Mode)..."
exec node frontend/server.js
