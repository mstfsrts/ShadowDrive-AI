// GET /api/profile/stats — User's overall statistics
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
        const [
            completedCount,
            masteredCount,
            avgPronunciation,
            aiCount,
            customCount,
            totalRepetitions,
            streak,
        ] = await Promise.all([
            // Completed lessons (any lesson completed at least once)
            prisma.progress.count({ where: { userId, completed: true } }),
            // Mastered lessons (completionCount >= targetCount)
            prisma.$queryRaw<[{ count: bigint }]>`
                SELECT COUNT(*)::bigint as count FROM "Progress"
                WHERE "userId" = ${userId} AND "completionCount" >= "targetCount"
            `.then(r => Number(r[0]?.count ?? 0)),
            // Average pronunciation score
            prisma.pronunciationAttempt.aggregate({
                where: { userId },
                _avg: { score: true },
            }),
            // AI lessons count
            prisma.generatedScenario.count({ where: { userId } }),
            // Custom lessons count
            prisma.customLesson.count({ where: { userId } }),
            // Total repetitions (sum of completion counts)
            prisma.progress.aggregate({
                where: { userId },
                _sum: { completionCount: true },
            }),
            // Daily streak
            calculateStreak(prisma, userId),
        ]);

        return NextResponse.json({
            completedLessons: completedCount,
            masteredLessons: masteredCount,
            pronunciationScore: (avgPronunciation._avg.score ?? 0) * 100,
            dailyStreak: streak,
            totalRepetitions: totalRepetitions._sum.completionCount ?? 0,
            aiLessons: aiCount,
            customLessons: customCount,
        });
    } catch (error) {
        console.error("[GET /api/profile/stats]", error);
        return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
    }
}

async function calculateStreak(prisma: NonNullable<ReturnType<typeof getPrisma>>, userId: string): Promise<number> {
    const activities = await prisma.dailyActivity.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 60,
        select: { date: true, lessonsCount: true },
    });

    if (activities.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 0; d < 60; d++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - d);
        const dateStr = checkDate.toISOString().slice(0, 10);

        const activity = activities.find(
            a => new Date(a.date).toISOString().slice(0, 10) === dateStr,
        );

        if (activity && activity.lessonsCount > 0) {
            streak++;
        } else if (d === 0) {
            // Today hasn't started yet — skip
            continue;
        } else {
            break;
        }
    }

    return streak;
}
