// DELETE/PATCH /api/custom-lessons/[id] — Delete or rename a saved custom lesson
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPrisma } from '@/lib/prisma';

// ─── DELETE — Remove a saved custom lesson ────────────────────────────────────

export async function DELETE(
    _: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });

    const { id } = await params;

    try {
        const lesson = await prisma.customLesson.findUnique({ where: { id } });
        if (!lesson || lesson.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        await prisma.customLesson.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[DELETE /api/custom-lessons]', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}

// ─── PATCH — Rename a saved custom lesson ────────────────────────────────────

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });

    const { id } = await params;

    try {
        const { title } = await request.json() as { title: string };
        if (!title?.trim()) {
            return NextResponse.json({ error: 'title required' }, { status: 400 });
        }

        const lesson = await prisma.customLesson.findUnique({ where: { id } });
        if (!lesson || lesson.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const updated = await prisma.customLesson.update({
            where: { id },
            data: { title: title.trim() },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('[PATCH /api/custom-lessons]', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
