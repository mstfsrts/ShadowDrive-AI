// GET /api/pronunciation/stats — Daily, weekly, monthly pronunciation trends
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
        // Run all three queries concurrently — they're independent
        const [daily, weekly, monthly] = await Promise.all([
            // Daily stats (last 7 days)
            prisma.$queryRaw<Array<{
                date: string;
                attempts: bigint;
                correct: bigint;
                avgScore: number | null;
            }>>`
                SELECT
                    TO_CHAR("createdAt"::date, 'YYYY-MM-DD') as date,
                    COUNT(*)::bigint as attempts,
                    COUNT(*) FILTER (WHERE score >= 0.70)::bigint as correct,
                    AVG(score) as "avgScore"
                FROM "PronunciationAttempt"
                WHERE "userId" = ${userId}
                  AND "createdAt" >= NOW() - INTERVAL '7 days'
                GROUP BY "createdAt"::date
                ORDER BY "createdAt"::date
            `,
            // Weekly stats (last 4 weeks)
            prisma.$queryRaw<Array<{
                week: string;
                attempts: bigint;
                correct: bigint;
                avgScore: number | null;
            }>>`
                SELECT
                    TO_CHAR(DATE_TRUNC('week', "createdAt"), 'YYYY-MM-DD') as week,
                    COUNT(*)::bigint as attempts,
                    COUNT(*) FILTER (WHERE score >= 0.70)::bigint as correct,
                    AVG(score) as "avgScore"
                FROM "PronunciationAttempt"
                WHERE "userId" = ${userId}
                  AND "createdAt" >= NOW() - INTERVAL '4 weeks'
                GROUP BY DATE_TRUNC('week', "createdAt")
                ORDER BY DATE_TRUNC('week', "createdAt")
            `,
            // Monthly stats (last 6 months)
            prisma.$queryRaw<Array<{
                month: string;
                attempts: bigint;
                correct: bigint;
                avgScore: number | null;
            }>>`
                SELECT
                    TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
                    COUNT(*)::bigint as attempts,
                    COUNT(*) FILTER (WHERE score >= 0.70)::bigint as correct,
                    AVG(score) as "avgScore"
                FROM "PronunciationAttempt"
                WHERE "userId" = ${userId}
                  AND "createdAt" >= NOW() - INTERVAL '6 months'
                GROUP BY DATE_TRUNC('month', "createdAt")
                ORDER BY DATE_TRUNC('month', "createdAt")
            `,
        ]);

        const format = (rows: Array<{ attempts: bigint; correct: bigint; avgScore: number | null; [key: string]: unknown }>) => rows.map(r => ({
            ...r,
            attempts: Number(r.attempts),
            correct: Number(r.correct),
            avgScore: r.avgScore ? Math.round(r.avgScore * 100) : 0,
        }));

        return NextResponse.json({
            daily: format(daily),
            weekly: format(weekly),
            monthly: format(monthly),
        });
    } catch (e) {
        console.error("[pronunciation/stats] error:", e);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
