// ─── Progress Routes ───
// GET  /api/progress — list user's lesson progress
// POST /api/progress — save/update progress for a lesson

import { Router, Response } from 'express';
import { SaveProgressSchema } from '../../../packages/shared/src/validators';
import { prisma } from '../services/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const progressRouter = Router();

// ─── Get Progress ───
progressRouter.get('/progress', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const progress = await prisma.progress.findMany({
      where: { userId: req.user!.userId },
      include: {
        lesson: {
          select: { id: true, title: true, courseId: true, sortOrder: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ data: progress });
  } catch (error) {
    console.error('[Progress] Get error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// ─── Save/Update Progress ───
progressRouter.post('/progress', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = SaveProgressSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
      return;
    }

    const { lessonId, completed } = parsed.data;
    const userId = req.user!.userId;

    const progress = await prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    console.log(`[Progress] ✅ User ${userId} → Lesson ${lessonId}: ${completed ? 'completed' : 'in progress'}`);

    res.json({ data: progress });
  } catch (error) {
    console.error('[Progress] Save error:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});
