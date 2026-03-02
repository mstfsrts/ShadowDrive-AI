// GET/POST /api/custom-lessons — User's saved custom text lessons
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPrisma } from '@/lib/prisma';

// ─── GET — Fetch user's saved custom lessons ──────────────────────────────────

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json([]);

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });

    try {
        const lessons = await prisma.customLesson.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(lessons);
    } catch (error) {
        console.error('[GET /api/custom-lessons]', error);
        return NextResponse.json({ error: 'Failed to load lessons' }, { status: 500 });
    }
}

// ─── POST — Save a custom lesson ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });

    try {
        const { title, content } = await request.json() as { title: string; content: object };

        if (!title?.trim() || !content) {
            return NextResponse.json({ error: 'title and content required' }, { status: 400 });
        }

        const lesson = await prisma.customLesson.create({
            data: {
                userId: session.user.id,
                title: title.trim(),
                content,
            },
        });
        return NextResponse.json(lesson, { status: 201 });
    } catch (error) {
        console.error('[POST /api/custom-lessons]', error);
        return NextResponse.json({ error: 'Failed to save lesson' }, { status: 500 });
    }
}
