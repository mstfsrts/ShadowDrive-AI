// GET /api/recordings — List recordings for the authenticated user
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    try {
        const recordings = await prisma.pronunciationAttempt.findMany({
            where: {
                userId: session.user.id,
            },
            select: {
                id: true,
                lessonTitle: true,
                lessonId: true,
                lineIndex: true,
                targetText: true,
                score: true,
                recordingUrl: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return NextResponse.json({ recordings });
    } catch (e) {
        console.error("[GET /api/recordings]", e);
        return NextResponse.json({ error: "Failed to fetch recordings" }, { status: 500 });
    }
}
