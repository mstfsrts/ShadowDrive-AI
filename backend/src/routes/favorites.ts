// ─── Favorites Routes ───
// GET  /api/favorites — list user's favorites
// POST /api/favorites — toggle favorite (add/remove)

import { Router, Response } from "express";
import { prisma } from "../services/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const favoritesRouter = Router();

// ─── Get Favorites ───
favoritesRouter.get("/favorites", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId: req.user!.userId },
        });

        res.json({ data: favorites });
    } catch (error) {
        console.error("[Favorites] Get error:", error);
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
});

// ─── Toggle Favorite ───
favoritesRouter.post("/favorites", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { courseId, lessonId } = req.body;
        const userId = req.user!.userId;

        if (!courseId && !lessonId) {
            res.status(400).json({ error: "courseId or lessonId is required" });
            return;
        }

        // Check if already favorited
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_courseId_lessonId: {
                    userId,
                    courseId: courseId || null,
                    lessonId: lessonId || null,
                },
            },
        });

        if (existing) {
            // Remove favorite
            await prisma.favorite.delete({ where: { id: existing.id } });
            console.log(`[Favorites] ❌ User ${userId} unfavorited course:${courseId} lesson:${lessonId}`);
            res.json({ data: null, removed: true });
        } else {
            // Add favorite
            const favorite = await prisma.favorite.create({
                data: {
                    userId,
                    courseId: courseId || null,
                    lessonId: lessonId || null,
                },
            });
            console.log(`[Favorites] ❤️ User ${userId} favorited course:${courseId} lesson:${lessonId}`);
            res.json({ data: favorite, removed: false });
        }
    } catch (error) {
        console.error("[Favorites] Toggle error:", error);
        res.status(500).json({ error: "Failed to toggle favorite" });
    }
});
