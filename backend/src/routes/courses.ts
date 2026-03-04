// ─── Courses Routes ───
// GET /api/courses — list all courses with lesson counts
// GET /api/courses/:id — get course with lessons

import { Router, Request, Response } from "express";
import { prisma } from "../services/prisma";
import { optionalAuth, AuthRequest } from "../middleware/auth";

export const coursesRouter = Router();

// ─── List Courses ───
coursesRouter.get("/courses", optionalAuth, async (_req: Request, res: Response) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                lessons: {
                    select: { id: true, title: true, order: true, content: true },
                    orderBy: { order: "asc" },
                },
            },
            orderBy: { order: "asc" },
        });

        // Transform to include lesson count and content shape expected by frontend
        const result = courses.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            emoji: c.emoji,
            color: c.color,
            order: c.order,
            category: c.category,
            subcategory: c.subcategory,
            lessons: c.lessons,
            _count: { lessons: c.lessons.length },
        }));

        res.json(result);
    } catch (error) {
        console.error("[Courses] List error:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

// ─── Get Course with Full Lessons ───
coursesRouter.get("/courses/:id", optionalAuth, async (req: AuthRequest, res: Response) => {
    try {
        const courseId = req.params.id as string;

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                lessons: {
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }

        // If user is authenticated, include their progress for this course's lessons
        let progressMap: Record<string, { completed: boolean; completionCount: number; targetCount: number }> = {};
        if (req.user) {
            const userProgress = await prisma.progress.findMany({
                where: {
                    userId: req.user.userId,
                    courseId: courseId,
                },
            });
            progressMap = Object.fromEntries(userProgress.map(p => [p.lessonId, { completed: p.completed, completionCount: p.completionCount, targetCount: p.targetCount }]));
        }

        res.json({
            ...course,
            progress: progressMap,
        });
    } catch (error) {
        console.error("[Courses] Get error:", error);
        res.status(500).json({ error: "Failed to fetch course" });
    }
});
