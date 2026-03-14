// POST /api/admin/provider-test — Test an LLM provider connection (admin-only)
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getConfiguredProviders } from "@/lib/providers";

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { provider: providerName } = await request.json();

        if (!providerName || typeof providerName !== "string") {
            return NextResponse.json({ error: "Provider name required" }, { status: 400 });
        }

        const providers = getConfiguredProviders();
        const provider = providers.find(
            (p) => p.name.toLowerCase() === providerName.toLowerCase()
        );

        if (!provider) {
            return NextResponse.json({
                success: false,
                error: `Provider "${providerName}" is not configured. Check API key env var.`,
            });
        }

        const start = Date.now();
        const result = await provider.generate("Say hello in one word.", 20);
        const latencyMs = Date.now() - start;

        return NextResponse.json({
            success: true,
            provider: provider.name,
            latencyMs,
            response: result.slice(0, 100),
        });
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return NextResponse.json({
            success: false,
            error: message,
        });
    }
}
