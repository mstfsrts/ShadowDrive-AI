// ─── Progress Routes ───
// GET  /api/progress — list user's lesson progress
// POST /api/progress — save/update progress for a lesson

import { Router, Response } from "express";
import { prisma } from "../services/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const progressRouter = Router();

// ─── Get Progress ───
progressRouter.get("/progress", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const progress = await prisma.progress.findMany({
            where: { userId: req.user!.userId },
            orderBy: { updatedAt: "desc" },
        });

        res.json(progress);
    } catch (error) {
        console.error("[Progress] Get error:", error);
        res.status(500).json({ error: "Failed to fetch progress" });
    }
});

// ─── Save/Update Progress ───
progressRouter.post("/progress", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { courseId, lessonId, lastLineIndex, completed } = req.body;

        if (!courseId || !lessonId) {
            res.status(400).json({ error: "courseId and lessonId are required" });
            return;
        }

        const userId = req.user!.userId;

        const progress = await prisma.progress.upsert({
            where: {
                userId_courseId_lessonId: { userId, courseId, lessonId },
            },
            update: {
                lastLineIndex: lastLineIndex ?? 0,
                completed: completed ?? false,
                completedAt: completed ? new Date() : undefined,
                completionCount: completed ? { increment: 1 } : undefined,
            },
            create: {
                userId,
                courseId,
                lessonId,
                lastLineIndex: lastLineIndex ?? 0,
                completed: completed ?? false,
                completedAt: completed ? new Date() : null,
                completionCount: completed ? 1 : 0,
            },
        });

        console.log(`[Progress] ✅ User ${userId} → Course ${courseId} / Lesson ${lessonId}: ${completed ? "completed" : "in progress"}`);

        res.json(progress);
    } catch (error) {
        console.error("[Progress] Save error:", error);
        res.status(500).json({ error: "Failed to save progress" });
    }
});
