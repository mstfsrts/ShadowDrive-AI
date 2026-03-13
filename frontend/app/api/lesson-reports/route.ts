// POST /api/lesson-reports — Save a lesson report
// GET /api/lesson-reports?lessonId=X — Get reports for a lesson
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { z } from "zod";

const ReportSchema = z.object({
    lessonType: z.enum(["course", "ai", "custom"]),
    lessonId: z.string(),
    lessonTitle: z.string(),
    totalLines: z.number().min(1),
    correctCount: z.number().min(0),
    averageScore: z.number().min(0).max(1),
});

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    try {
        const body = await request.json();
        const parsed = ReportSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
        }

        const report = await prisma.lessonReport.create({
            data: {
                userId: session.user.id,
                ...parsed.data,
            },
        });

        return NextResponse.json(report, { status: 201 });
    } catch (error) {
        console.error("[POST /api/lesson-reports]", error);
        return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const lessonId = request.nextUrl.searchParams.get("lessonId");

    try {
        const where: { userId: string; lessonId?: string } = { userId: session.user.id };
        if (lessonId) where.lessonId = lessonId;

        const reports = await prisma.lessonReport.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        return NextResponse.json(reports);
    } catch (error) {
        console.error("[GET /api/lesson-reports]", error);
        return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
    }
}
