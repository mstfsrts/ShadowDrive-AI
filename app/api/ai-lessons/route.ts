// GET/POST /api/ai-lessons — User's saved AI-generated scenarios
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPrisma } from '@/lib/prisma';

// ─── GET — Fetch user's saved AI lessons ─────────────────────────────────────

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json([]);

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });

    try {
        const lessons = await prisma.generatedScenario.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, topic: true, level: true, content: true, createdAt: true },
        });
        return NextResponse.json(lessons);
    } catch (error) {
        console.error('[GET /api/ai-lessons]', error);
        return NextResponse.json({ error: 'Failed to load lessons' }, { status: 500 });
    }
}

// ─── POST — Save a generated scenario ────────────────────────────────────────

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });

    try {
        const { topic, title, level, content } = await request.json() as {
            topic: string;
            title?: string;
            level: string;
            content: object;
        };

        if (!topic || !level || !content) {
            return NextResponse.json({ error: 'topic, level, content required' }, { status: 400 });
        }

        const lesson = await prisma.generatedScenario.create({
            data: {
                userId: session.user.id,
                topicHash: `${session.user.id}:${topic}:${Date.now()}`,
                topic,
                title: title || null,
                level,
                content,
            },
        });
        return NextResponse.json(lesson, { status: 201 });
    } catch (error) {
        console.error('[POST /api/ai-lessons]', error);
        return NextResponse.json({ error: 'Failed to save lesson' }, { status: 500 });
    }
}
