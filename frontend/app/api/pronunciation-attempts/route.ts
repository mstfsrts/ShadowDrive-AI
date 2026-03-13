// POST /api/pronunciation-attempts — Save pronunciation attempt(s)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { z } from "zod";

const AttemptSchema = z.object({
    lessonType: z.enum(["course", "ai", "custom"]),
    lessonId: z.string(),
    lessonTitle: z.string(),
    lineIndex: z.number(),
    targetText: z.string(),
    transcript: z.string(),
    score: z.number().min(0).max(1),
    correct: z.boolean(),
    recordingUrl: z.string().optional(),
});

const BatchSchema = z.object({
    attempts: z.array(AttemptSchema).min(1).max(50),
});

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    try {
        const body = await request.json();
        const parsed = BatchSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
        }

        const userId = session.user.id;

        // Save all attempts
        await prisma.pronunciationAttempt.createMany({
            data: parsed.data.attempts.map(a => ({
                userId,
                ...a,
            })),
        });

        // Update daily activity
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await prisma.dailyActivity.upsert({
            where: { userId_date: { userId, date: today } },
            create: { userId, date: today, lessonsCount: 1 },
            update: { lessonsCount: { increment: 1 } },
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[POST /api/pronunciation-attempts]", error);
        return NextResponse.json({ error: "Failed to save attempts" }, { status: 500 });
    }
}
