-- CreateTable: PronunciationAttempt
CREATE TABLE "PronunciationAttempt" (
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

-- CreateTable: LessonReport
CREATE TABLE "LessonReport" (
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

-- CreateTable: DailyActivity
CREATE TABLE "DailyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "lessonsCount" INTEGER NOT NULL DEFAULT 0,
    "practiceMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserGoal
CREATE TABLE "UserGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyTarget" INTEGER NOT NULL DEFAULT 2,
    "weeklyTarget" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "UserGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PronunciationAttempt_userId_lessonId_idx" ON "PronunciationAttempt"("userId", "lessonId");
CREATE INDEX "PronunciationAttempt_userId_createdAt_idx" ON "PronunciationAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LessonReport_userId_lessonId_idx" ON "LessonReport"("userId", "lessonId");
CREATE INDEX "LessonReport_userId_createdAt_idx" ON "LessonReport"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyActivity_userId_date_key" ON "DailyActivity"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "UserGoal_userId_key" ON "UserGoal"("userId");

-- AddForeignKey
ALTER TABLE "PronunciationAttempt" ADD CONSTRAINT "PronunciationAttempt_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonReport" ADD CONSTRAINT "LessonReport_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserGoal" ADD CONSTRAINT "UserGoal_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
