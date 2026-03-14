// GET/PATCH /api/admin/settings — System configuration (admin-only)
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return null;
    }
    return session;
}

export async function GET() {
    if (!await requireAdmin()) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    try {
        const config = await prisma.systemConfig.findUnique({
            where: { key: "llm_config" },
        });

        return NextResponse.json({
            llmConfig: config?.value ?? {
                activeProvider: "openrouter",
                providers: {
                    openrouter: { enabled: !!process.env.OPENROUTER_API_KEY, model: process.env.OPENROUTER_MODEL || "qwen/qwen3-235b-a22b" },
                    gemini: { enabled: !!process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || "gemini-2.5-flash" },
                    anthropic: { enabled: !!process.env.ANTHROPIC_API_KEY, model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6" },
                    openai: { enabled: !!process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL || "gpt-4o-mini" },
                },
            },
        });
    } catch (e) {
        console.error("[admin/settings] GET error:", e);
        return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    if (!await requireAdmin()) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    try {
        const body = await request.json();
        const { llmConfig } = body;

        if (!llmConfig || typeof llmConfig !== "object") {
            return NextResponse.json({ error: "Invalid config" }, { status: 400 });
        }

        const updated = await prisma.systemConfig.upsert({
            where: { key: "llm_config" },
            create: { key: "llm_config", value: llmConfig },
            update: { value: llmConfig },
        });

        return NextResponse.json({ success: true, config: updated.value });
    } catch (e) {
        console.error("[admin/settings] PATCH error:", e);
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
