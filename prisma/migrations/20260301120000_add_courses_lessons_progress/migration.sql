-- Phase 4–5: Course/Lesson migration + Progress counters + CustomLesson

-- ─── Progress: spaced repetition counters ────────────────────────────────────
ALTER TABLE "Progress" ADD COLUMN "completionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Progress" ADD COLUMN "targetCount" INTEGER NOT NULL DEFAULT 4;

-- ─── GeneratedScenario: optional user-facing title ───────────────────────────
ALTER TABLE "GeneratedScenario" ADD COLUMN "title" TEXT;

-- CreateIndex
CREATE INDEX "GeneratedScenario_userId_idx" ON "GeneratedScenario"("userId");

-- ─── Course content (migrated from JSON files) ───────────────────────────────
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "content" JSONB NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lesson_courseId_idx" ON "Lesson"("courseId");

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── User-created custom lessons ─────────────────────────────────────────────
CREATE TABLE "CustomLesson" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomLesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomLesson_userId_idx" ON "CustomLesson"("userId");

-- AddForeignKey
ALTER TABLE "CustomLesson" ADD CONSTRAINT "CustomLesson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
