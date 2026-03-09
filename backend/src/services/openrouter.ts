// ─── OpenRouter Service ───
// Cloud AI provider via OpenRouter (openrouter.ai).
// Uses OpenAI-compatible API. Set OPENROUTER_API_KEY in env vars to enable.

const TIMEOUT_MS = 60_000;

export function isOpenRouterConfigured(): boolean {
    return !!process.env.OPENROUTER_API_KEY;
}

export async function generateWithOpenRouter(prompt: string, maxTokens: number = 2048): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "qwen/qwen3-235b-a22b";

    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        console.log(`[OpenRouter] → model: ${model}`);

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
                "HTTP-Referer": "https://shadowdrive.ai",
                "X-Title": "ShadowDrive AI",
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: maxTokens,
                temperature: 0.7,
            }),
            signal: controller.signal,
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => res.statusText);
            throw new Error(`OpenRouter returned ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        let text: string = data.choices?.[0]?.message?.content ?? "";

        if (!text) {
            throw new Error("OpenRouter returned an empty response");
        }

        // Strip <think>...</think> blocks from thinking models
        text = text.replace(/<think>[\s\S]*?<\/think>\s*/g, "").trim();

        console.log(`[OpenRouter] ✅ OK — ${text.length} chars`);
        return text;
    } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
            throw new Error(`OpenRouter timed out after ${TIMEOUT_MS / 1000}s`);
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
}
