// ─── Favorites Routes ───
// GET  /api/favorites — list user's favorites
// POST /api/favorites — toggle favorite (add/remove)

import { Router, Response } from 'express';
import { ToggleFavoriteSchema } from '../../../packages/shared/src/validators';
import { prisma } from '../services/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const favoritesRouter = Router();

// ─── Get Favorites ───
favoritesRouter.get('/favorites', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.userId },
    });

    res.json({ data: favorites });
  } catch (error) {
    console.error('[Favorites] Get error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// ─── Toggle Favorite ───
favoritesRouter.post('/favorites', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = ToggleFavoriteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
      return;
    }

    const { type, targetId } = parsed.data;
    const userId = req.user!.userId;

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: { userId_type_targetId: { userId, type, targetId } },
    });

    if (existing) {
      // Remove favorite
      await prisma.favorite.delete({ where: { id: existing.id } });
      console.log(`[Favorites] ❌ User ${userId} unfavorited ${type}:${targetId}`);
      res.json({ data: null, removed: true });
    } else {
      // Add favorite
      const favorite = await prisma.favorite.create({
        data: { userId, type, targetId },
      });
      console.log(`[Favorites] ❤️ User ${userId} favorited ${type}:${targetId}`);
      res.json({ data: favorite, removed: false });
    }
  } catch (error) {
    console.error('[Favorites] Toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});
