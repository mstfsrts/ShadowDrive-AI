// GET /api/courses/[id] — Single course with lessons
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });

    try {
        const course = await prisma.course.findUnique({
            where: { id: params.id },
            include: {
                lessons: {
                    orderBy: { order: 'asc' },
                    select: { id: true, title: true, order: true, content: true },
                },
            },
        });
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }
        return NextResponse.json(course);
    } catch (error) {
        console.error('[GET /api/courses/[id]]', error);
        return NextResponse.json({ error: 'Failed to load course' }, { status: 500 });
    }
}
