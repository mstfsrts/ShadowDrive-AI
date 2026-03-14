// ─── ShadowDrive AI — Provider Registry ───
// Import this file to register all AI providers in priority order.
// New provider? Add import here + create provider file.

import './openrouter';
import './gemini';
import './anthropic';
import './openai';

export { generateWithProviders, getConfiguredProvider, getConfiguredProviders } from '@/lib/ai-provider';
