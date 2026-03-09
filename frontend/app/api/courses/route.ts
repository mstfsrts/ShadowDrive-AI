// GET /api/courses — All courses with their lessons
import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });

    try {
        const courses = await prisma.course.findMany({
            orderBy: { order: 'asc' },
            include: {
                lessons: {
                    orderBy: { order: 'asc' },
                    select: { id: true, title: true, order: true, content: true },
                },
            },
        });
        return NextResponse.json(courses);
    } catch (error) {
        console.error('[GET /api/courses]', error);
        return NextResponse.json({ error: 'Failed to load courses' }, { status: 500 });
    }
}
