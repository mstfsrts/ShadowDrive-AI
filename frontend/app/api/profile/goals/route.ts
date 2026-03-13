// GET/PATCH /api/profile/goals — User's daily/weekly goals
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const userId = session.user.id;

    try {
        // Get or create goal
        const goal = await prisma.userGoal.upsert({
            where: { userId },
            create: { userId, dailyTarget: 2, weeklyTarget: 10 },
            update: {},
        });

        // Today's count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayActivity = await prisma.dailyActivity.findUnique({
            where: { userId_date: { userId, date: today } },
        });

        // This week's count (Monday to Sunday)
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
        const weekActivities = await prisma.dailyActivity.aggregate({
            where: { userId, date: { gte: monday } },
            _sum: { lessonsCount: true },
        });

        return NextResponse.json({
            dailyTarget: goal.dailyTarget,
            weeklyTarget: goal.weeklyTarget,
            todayCount: todayActivity?.lessonsCount ?? 0,
            weekCount: weekActivities._sum.lessonsCount ?? 0,
        });
    } catch (error) {
        console.error("[GET /api/profile/goals]", error);
        return NextResponse.json({ error: "Failed to load goals" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    try {
        const { dailyTarget, weeklyTarget } = await request.json();

        const daily = Math.max(1, Math.min(10, Number(dailyTarget) || 2));
        const weekly = Math.max(1, Math.min(70, Number(weeklyTarget) || daily * 5));

        const goal = await prisma.userGoal.upsert({
            where: { userId: session.user.id },
            create: { userId: session.user.id, dailyTarget: daily, weeklyTarget: weekly },
            update: { dailyTarget: daily, weeklyTarget: weekly },
        });

        // Re-fetch today/week counts
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayActivity = await prisma.dailyActivity.findUnique({
            where: { userId_date: { userId: session.user.id, date: today } },
        });
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
        const weekActivities = await prisma.dailyActivity.aggregate({
            where: { userId: session.user.id, date: { gte: monday } },
            _sum: { lessonsCount: true },
        });

        return NextResponse.json({
            dailyTarget: goal.dailyTarget,
            weeklyTarget: goal.weeklyTarget,
            todayCount: todayActivity?.lessonsCount ?? 0,
            weekCount: weekActivities._sum.lessonsCount ?? 0,
        });
    } catch (error) {
        console.error("[PATCH /api/profile/goals]", error);
        return NextResponse.json({ error: "Failed to update goals" }, { status: 500 });
    }
}
