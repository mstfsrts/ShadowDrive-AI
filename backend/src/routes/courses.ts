// ─── Courses Routes ───
// GET /api/courses — list all courses
// GET /api/courses/:id — get course with lessons

import { Router, Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { optionalAuth, AuthRequest } from '../middleware/auth';

export const coursesRouter = Router();

// ─── List Courses ───
coursesRouter.get('/courses', optionalAuth, async (_req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        _count: { select: { lessons: true } },
      },
      orderBy: { id: 'asc' },
    });

    res.json({ data: courses });
  } catch (error) {
    console.error('[Courses] List error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// ─── Get Course with Lessons ───
coursesRouter.get('/courses/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (isNaN(courseId)) {
      res.status(400).json({ error: 'Invalid course ID' });
      return;
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // If user is authenticated, include their progress for this course's lessons
    let progress: Record<number, boolean> = {};
    if (req.user) {
      const userProgress = await prisma.progress.findMany({
        where: {
          userId: req.user.userId,
          lessonId: { in: course.lessons.map(l => l.id) },
        },
      });
      progress = Object.fromEntries(
        userProgress.map(p => [p.lessonId, p.completed])
      );
    }

    res.json({
      data: {
        ...course,
        progress,
      },
    });
  } catch (error) {
    console.error('[Courses] Get error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});
