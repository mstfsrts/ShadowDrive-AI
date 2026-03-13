// ─── ShadowDrive AI — Multi-Provider AI Interface ───
// Abstraction layer for AI providers. Add new provider = 1 file + 1 env var.
// Usage: getConfiguredProvider() returns the first available provider.

export interface AIProvider {
    name: string;
    generate(prompt: string, maxTokens: number): Promise<string>;
    isConfigured(): boolean;
}

// Provider registry — ordered by priority
const providers: AIProvider[] = [];

export function registerProvider(provider: AIProvider): void {
    providers.push(provider);
}

/**
 * Returns the first configured provider, or null if none are available.
 */
export function getConfiguredProvider(): AIProvider | null {
    return providers.find(p => p.isConfigured()) ?? null;
}

/**
 * Returns all configured providers (for fallback chain).
 */
export function getConfiguredProviders(): AIProvider[] {
    return providers.filter(p => p.isConfigured());
}

/**
 * Try each configured provider in order. First success wins.
 * If all fail, throws the last error.
 */
export async function generateWithProviders(prompt: string, maxTokens: number): Promise<string> {
    const configured = getConfiguredProviders();

    if (configured.length === 0) {
        throw new Error('No AI providers configured. Set OPENROUTER_API_KEY or GEMINI_API_KEY in environment.');
    }

    let lastError: Error | null = null;

    for (const provider of configured) {
        try {
            return await provider.generate(prompt, maxTokens);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn(`[ai-provider] ${provider.name} failed: ${message}`);
            lastError = err instanceof Error ? err : new Error(message);
        }
    }

    throw lastError ?? new Error('All AI providers failed');
}
