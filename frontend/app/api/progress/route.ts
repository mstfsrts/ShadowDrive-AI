// POST/GET /api/progress — Track lesson completion + spaced repetition
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPrisma } from '@/lib/prisma';

// ─── GET — Fetch user's progress ─────────────────────────────────────────────

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrisma();
    if (!prisma) {
        return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    }

    try {
        const progress = await prisma.progress.findMany({
            where: { userId: session.user.id },
        });
        return NextResponse.json(progress);
    } catch (error) {
        console.error('[GET /api/progress]', error);
        return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 });
    }
}

// ─── POST — Save/update lesson progress ──────────────────────────────────────

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrisma();
    if (!prisma) {
        return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { courseId, lessonId, lastLineIndex, completed } = body as {
            courseId: string;
            lessonId: string;
            lastLineIndex: number;
            completed: boolean;
        };

        if (!courseId || !lessonId) {
            return NextResponse.json({ error: 'courseId and lessonId required' }, { status: 400 });
        }

        const userId = session.user.id;

        // Check existing progress for completionCount increment
        const existing = await prisma.progress.findUnique({
            where: { userId_courseId_lessonId: { userId, courseId, lessonId } },
        });

        const now = new Date();
        const newCompletionCount = completed
            ? (existing?.completionCount ?? 0) + 1
            : (existing?.completionCount ?? 0);

        const progress = await prisma.progress.upsert({
            where: { userId_courseId_lessonId: { userId, courseId, lessonId } },
            create: {
                userId,
                courseId,
                lessonId,
                lastLineIndex: lastLineIndex ?? 0,
                completed: completed ?? false,
                completedAt: completed ? now : null,
                completionCount: completed ? 1 : 0,
            },
            update: {
                lastLineIndex: lastLineIndex ?? existing?.lastLineIndex ?? 0,
                completed: completed || existing?.completed || false,
                completedAt: completed ? now : existing?.completedAt,
                completionCount: newCompletionCount,
            },
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error('[POST /api/progress]', error);
        return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }
}
