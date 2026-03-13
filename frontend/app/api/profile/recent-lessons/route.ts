// GET /api/profile/recent-lessons — Recent lesson reports
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    try {
        const reports = await prisma.lessonReport.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
                lessonType: true,
                lessonId: true,
                lessonTitle: true,
                averageScore: true,
                createdAt: true,
            },
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error("[GET /api/profile/recent-lessons]", error);
        return NextResponse.json({ error: "Failed to load recent lessons" }, { status: 500 });
    }
}
