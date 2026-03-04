// ─── AI Lessons Routes ───
// GET    /api/ai-lessons     — list saved AI lessons
// POST   /api/ai-lessons     — save a new AI lesson
// PATCH  /api/ai-lessons/:id — rename
// DELETE /api/ai-lessons/:id — delete

import { Router, Response } from "express";
import { prisma } from "../services/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const aiLessonsRouter = Router();

// ─── List Saved AI Lessons ───
aiLessonsRouter.get("/ai-lessons", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const lessons = await prisma.generatedScenario.findMany({
            where: { userId: req.user!.userId },
            orderBy: { createdAt: "desc" },
        });

        res.json(lessons);
    } catch (error) {
        console.error("[AI Lessons] List error:", error);
        res.status(500).json({ error: "Failed to fetch AI lessons" });
    }
});

// ─── Save AI Lesson ───
aiLessonsRouter.post("/ai-lessons", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { topic, title, level, content } = req.body;

        if (!topic || !content) {
            res.status(400).json({ error: "topic and content are required" });
            return;
        }

        const topicHash = `${req.user!.userId}:${topic}:${Date.now()}`;

        const lesson = await prisma.generatedScenario.create({
            data: {
                userId: req.user!.userId,
                topicHash,
                topic,
                title: title || topic,
                level: level || "A0-A1",
                content,
            },
        });

        console.log(`[AI Lessons] ✅ Saved: "${lesson.title}" for user ${req.user!.userId}`);
        res.status(201).json(lesson);
    } catch (error) {
        console.error("[AI Lessons] Save error:", error);
        res.status(500).json({ error: "Failed to save AI lesson" });
    }
});

// ─── Rename AI Lesson ───
aiLessonsRouter.patch("/ai-lessons/:id", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { title } = req.body;

        if (!title || !title.trim()) {
            res.status(400).json({ error: "title is required" });
            return;
        }

        // Check ownership
        const existing = await prisma.generatedScenario.findUnique({ where: { id } });
        if (!existing || existing.userId !== req.user!.userId) {
            res.status(404).json({ error: "Lesson not found" });
            return;
        }

        const updated = await prisma.generatedScenario.update({
            where: { id },
            data: { title: title.trim() },
        });

        res.json(updated);
    } catch (error) {
        console.error("[AI Lessons] Rename error:", error);
        res.status(500).json({ error: "Failed to rename lesson" });
    }
});

// ─── Delete AI Lesson ───
aiLessonsRouter.delete("/ai-lessons/:id", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;

        // Check ownership
        const existing = await prisma.generatedScenario.findUnique({ where: { id } });
        if (!existing || existing.userId !== req.user!.userId) {
            res.status(404).json({ error: "Lesson not found" });
            return;
        }

        await prisma.generatedScenario.delete({ where: { id } });

        console.log(`[AI Lessons] 🗑 Deleted: "${existing.title}" for user ${req.user!.userId}`);
        res.json({ success: true });
    } catch (error) {
        console.error("[AI Lessons] Delete error:", error);
        res.status(500).json({ error: "Failed to delete lesson" });
    }
});
