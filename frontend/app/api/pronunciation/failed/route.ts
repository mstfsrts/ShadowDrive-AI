// GET /api/pronunciation/failed — Get failed and weak pronunciation attempts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const userId = session.user.id;

    try {
        // Get the latest attempt per (lessonId, lineIndex) combination
        // Only include attempts with score < 0.70
        const failedAttempts = await prisma.$queryRaw<Array<{
            id: string;
            lessonType: string;
            lessonId: string;
            lessonTitle: string;
            lineIndex: number;
            targetText: string;
            transcript: string;
            score: number;
            createdAt: Date;
        }>>`
            SELECT DISTINCT ON ("lessonId", "lineIndex")
                "id", "lessonType", "lessonId", "lessonTitle", "lineIndex",
                "targetText", "transcript", "score", "createdAt"
            FROM "PronunciationAttempt"
            WHERE "userId" = ${userId} AND "score" < 0.70
            ORDER BY "lessonId", "lineIndex", "createdAt" DESC
            LIMIT 50
        `;

        // Split into two categories
        const critical = failedAttempts.filter(a => a.score < 0.40);   // Red: hatali
        const needsRetry = failedAttempts.filter(a => a.score >= 0.40); // Orange: tekrar gerekli

        // Get overall stats
        const stats = await prisma.$queryRaw<[{
            total: bigint;
            correct: bigint;
            avgScore: number | null;
        }]>`
            SELECT
                COUNT(*)::bigint as total,
                COUNT(*) FILTER (WHERE score >= 0.70)::bigint as correct,
                AVG(score) as "avgScore"
            FROM "PronunciationAttempt"
            WHERE "userId" = ${userId}
            AND "createdAt" >= NOW() - INTERVAL '30 days'
        `;

        const stat = stats[0];

        return NextResponse.json({
            critical,
            needsRetry,
            stats: {
                totalAttempts: Number(stat.total),
                correctAttempts: Number(stat.correct),
                averageScore: stat.avgScore ? Math.round(stat.avgScore * 100) : 0,
                successRate: Number(stat.total) > 0
                    ? Math.round(Number(stat.correct) / Number(stat.total) * 100)
                    : 0,
            },
        });
    } catch (e) {
        console.error("[pronunciation/failed] error:", e);
        return NextResponse.json({ error: "Failed to fetch pronunciation data" }, { status: 500 });
    }
}
