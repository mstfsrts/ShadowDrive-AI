// ─── Custom Lessons Routes ───
// GET    /api/custom-lessons     — list saved custom lessons
// POST   /api/custom-lessons     — save a new custom lesson
// PATCH  /api/custom-lessons/:id — rename
// DELETE /api/custom-lessons/:id — delete

import { Router, Response } from "express";
import { prisma } from "../services/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const customLessonsRouter = Router();

// ─── List Saved Custom Lessons ───
customLessonsRouter.get("/custom-lessons", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const lessons = await prisma.customLesson.findMany({
            where: { userId: req.user!.userId },
            orderBy: { createdAt: "desc" },
        });

        res.json(lessons);
    } catch (error) {
        console.error("[Custom Lessons] List error:", error);
        res.status(500).json({ error: "Failed to fetch custom lessons" });
    }
});

// ─── Save Custom Lesson ───
customLessonsRouter.post("/custom-lessons", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { title, content } = req.body;

        if (!content) {
            res.status(400).json({ error: "content is required" });
            return;
        }

        const lesson = await prisma.customLesson.create({
            data: {
                userId: req.user!.userId,
                title: title || "Kendi Metnim",
                content,
            },
        });

        console.log(`[Custom Lessons] ✅ Saved: "${lesson.title}" for user ${req.user!.userId}`);
        res.status(201).json(lesson);
    } catch (error) {
        console.error("[Custom Lessons] Save error:", error);
        res.status(500).json({ error: "Failed to save custom lesson" });
    }
});

// ─── Rename Custom Lesson ───
customLessonsRouter.patch("/custom-lessons/:id", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { title } = req.body;

        if (!title || !title.trim()) {
            res.status(400).json({ error: "title is required" });
            return;
        }

        // Check ownership
        const existing = await prisma.customLesson.findUnique({ where: { id } });
        if (!existing || existing.userId !== req.user!.userId) {
            res.status(404).json({ error: "Lesson not found" });
            return;
        }

        const updated = await prisma.customLesson.update({
            where: { id },
            data: { title: title.trim() },
        });

        res.json(updated);
    } catch (error) {
        console.error("[Custom Lessons] Rename error:", error);
        res.status(500).json({ error: "Failed to rename lesson" });
    }
});

// ─── Delete Custom Lesson ───
customLessonsRouter.delete("/custom-lessons/:id", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;

        // Check ownership
        const existing = await prisma.customLesson.findUnique({ where: { id } });
        if (!existing || existing.userId !== req.user!.userId) {
            res.status(404).json({ error: "Lesson not found" });
            return;
        }

        await prisma.customLesson.delete({ where: { id } });

        console.log(`[Custom Lessons] 🗑 Deleted: "${existing.title}" for user ${req.user!.userId}`);
        res.json({ success: true });
    } catch (error) {
        console.error("[Custom Lessons] Delete error:", error);
        res.status(500).json({ error: "Failed to delete lesson" });
    }
});
