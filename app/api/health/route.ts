// ─── Debug Health Check ───
// GET /api/health — shows which env vars are configured (no secrets exposed)

import { NextResponse } from 'next/server';

export async function GET() {
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    return NextResponse.json({
        status: 'ok',
        env: {
            OPENROUTER_API_KEY: openrouterKey
                ? `set (${openrouterKey.substring(0, 8)}...${openrouterKey.slice(-4)})`
                : 'NOT SET',
            OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'NOT SET (default: qwen/qwen3-235b-a22b)',
            GEMINI_API_KEY: geminiKey && geminiKey !== 'your_gemini_api_key_here'
                ? `set (${geminiKey.substring(0, 8)}...${geminiKey.slice(-4)})`
                : 'NOT SET',
            NODE_ENV: process.env.NODE_ENV || 'NOT SET',
        },
        timestamp: new Date().toISOString(),
    });
}
