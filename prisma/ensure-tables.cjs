#!/usr/bin/env node
// ─── ShadowDrive AI — Fallback Table Creator ───
// Runs AFTER prisma migrate deploy. If migrate failed silently,
// this ensures all required tables exist using IF NOT EXISTS.
// Safe to run multiple times — idempotent.

const { PrismaClient } = require("@prisma/client");

const SQL = `
-- Profile feature tables (added 2026-03-13)

CREATE TABLE IF NOT EXISTS "PronunciationAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonType" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "lessonTitle" TEXT NOT NULL,
    "lineIndex" INTEGER NOT NULL,
    "targetText" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "recordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PronunciationAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LessonReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonType" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "lessonTitle" TEXT NOT NULL,
    "totalLines" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LessonReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DailyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "lessonsCount" INTEGER NOT NULL DEFAULT 0,
    "practiceMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyTarget" INTEGER NOT NULL DEFAULT 2,
    "weeklyTarget" INTEGER NOT NULL DEFAULT 10,
    CONSTRAINT "UserGoal_pkey" PRIMARY KEY ("id")
);

-- Indexes (IF NOT EXISTS supported in PostgreSQL 9.5+)

CREATE INDEX IF NOT EXISTS "PronunciationAttempt_userId_lessonId_idx"
    ON "PronunciationAttempt"("userId", "lessonId");
CREATE INDEX IF NOT EXISTS "PronunciationAttempt_userId_createdAt_idx"
    ON "PronunciationAttempt"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "LessonReport_userId_lessonId_idx"
    ON "LessonReport"("userId", "lessonId");
CREATE INDEX IF NOT EXISTS "LessonReport_userId_createdAt_idx"
    ON "LessonReport"("userId", "createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "DailyActivity_userId_date_key"
    ON "DailyActivity"("userId", "date");

CREATE UNIQUE INDEX IF NOT EXISTS "UserGoal_userId_key"
    ON "UserGoal"("userId");

-- Foreign keys (use DO $$ block to check existence first)

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PronunciationAttempt_userId_fkey') THEN
        ALTER TABLE "PronunciationAttempt" ADD CONSTRAINT "PronunciationAttempt_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LessonReport_userId_fkey') THEN
        ALTER TABLE "LessonReport" ADD CONSTRAINT "LessonReport_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DailyActivity_userId_fkey') THEN
        ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserGoal_userId_fkey') THEN
        ALTER TABLE "UserGoal" ADD CONSTRAINT "UserGoal_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
`;

async function main() {
    const prisma = new PrismaClient();
    try {
        await prisma.$executeRawUnsafe(SQL);
        console.log("✅ ensure-tables: All profile tables verified/created");
    } catch (err) {
        console.error("⚠️  ensure-tables failed:", err.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
