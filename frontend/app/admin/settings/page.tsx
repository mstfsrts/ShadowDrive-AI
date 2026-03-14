'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Zap, CheckCircle, XCircle, Loader2, Save } from 'lucide-react';

interface ProviderConfig {
    enabled: boolean;
    model: string;
}

interface LLMConfig {
    activeProvider: string;
    providers: Record<string, ProviderConfig>;
}

const PROVIDER_INFO: Record<string, { label: string; envKey: string; defaultModel: string; models: string[] }> = {
    openrouter: {
        label: 'OpenRouter',
        envKey: 'OPENROUTER_API_KEY',
        defaultModel: 'qwen/qwen3-235b-a22b',
        models: ['qwen/qwen3-235b-a22b', 'google/gemini-2.5-flash', 'anthropic/claude-3-haiku', 'openai/gpt-4o-mini', 'meta-llama/llama-4-maverick'],
    },
    gemini: {
        label: 'Google Gemini',
        envKey: 'GEMINI_API_KEY',
        defaultModel: 'gemini-2.5-flash',
        models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
    },
    anthropic: {
        label: 'Anthropic',
        envKey: 'ANTHROPIC_API_KEY',
        defaultModel: 'claude-sonnet-4-6',
        models: ['claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-opus-4-6'],
    },
    openai: {
        label: 'OpenAI',
        envKey: 'OPENAI_API_KEY',
        defaultModel: 'gpt-4o-mini',
        models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1-nano'],
    },
};

export default function AdminSettingsPage() {
    const [config, setConfig] = useState<LLMConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testResults, setTestResults] = useState<Record<string, { success: boolean; latencyMs?: number; error?: string; loading: boolean }>>({});
    const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchConfig = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setConfig(data.llmConfig);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchConfig(); }, [fetchConfig]);

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        setSaveMsg(null);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ llmConfig: config }),
            });
            if (res.ok) {
                setSaveMsg({ type: 'success', text: 'Configuration saved successfully' });
            } else {
                const data = await res.json();
                setSaveMsg({ type: 'error', text: data.error || 'Failed to save' });
            }
        } catch {
            setSaveMsg({ type: 'error', text: 'Network error' });
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(null), 3000);
        }
    };

    const handleTest = async (providerKey: string) => {
        setTestResults(prev => ({ ...prev, [providerKey]: { success: false, loading: true } }));
        try {
            const res = await fetch('/api/admin/provider-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: PROVIDER_INFO[providerKey].label }),
            });
            const data = await res.json();
            setTestResults(prev => ({
                ...prev,
                [providerKey]: { success: data.success, latencyMs: data.latencyMs, error: data.error, loading: false },
            }));
        } catch {
            setTestResults(prev => ({
                ...prev,
                [providerKey]: { success: false, error: 'Network error', loading: false },
            }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
        );
    }

    if (!config) {
        return <div className="p-8 text-rose-400">Failed to load configuration.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-2">System Settings</h1>
                    <p className="text-sm text-slate-400">Configure AI providers, models, and global platform variables.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20
                               text-emerald-400 font-medium text-sm border border-emerald-500/20 transition-colors
                               disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Configuration
                </button>
            </div>

            {saveMsg && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                    saveMsg.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                    {saveMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {saveMsg.text}
                </div>
            )}

            {/* Active Provider Selector */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <Settings className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Primary AI Provider</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Fallback chain: if primary fails, next configured provider is used automatically</p>
                    </div>
                </div>
                <select
                    value={config.activeProvider}
                    onChange={(e) => setConfig({ ...config, activeProvider: e.target.value })}
                    className="w-full bg-[#05080f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white
                               focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none cursor-pointer"
                >
                    {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                        <option key={key} value={key}>{info.label}</option>
                    ))}
                </select>
            </div>

            {/* Provider Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(PROVIDER_INFO).map(([key, info]) => {
                    const providerConfig = config.providers[key];
                    const isActive = config.activeProvider === key;
                    const test = testResults[key];

                    return (
                        <div
                            key={key}
                            className={`rounded-2xl border p-6 backdrop-blur-sm transition-all ${
                                isActive
                                    ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
                                    : 'border-white/5 bg-white/[0.02]'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-base font-semibold text-white">{info.label}</h4>
                                    {isActive && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            Primary
                                        </span>
                                    )}
                                </div>
                                <div className={`w-2.5 h-2.5 rounded-full ${providerConfig?.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
                                        Model
                                    </label>
                                    <select
                                        value={providerConfig?.model || info.defaultModel}
                                        onChange={(e) => {
                                            setConfig({
                                                ...config,
                                                providers: {
                                                    ...config.providers,
                                                    [key]: { ...providerConfig, model: e.target.value },
                                                },
                                            });
                                        }}
                                        className="w-full bg-[#05080f] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                                                   focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none"
                                    >
                                        {info.models.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="text-xs text-slate-600">
                                    Env: <code className="text-slate-400">{info.envKey}</code>
                                    {providerConfig?.enabled
                                        ? <span className="ml-2 text-emerald-500">configured</span>
                                        : <span className="ml-2 text-slate-500">not set</span>
                                    }
                                </div>

                                <button
                                    onClick={() => handleTest(key)}
                                    disabled={test?.loading || !providerConfig?.enabled}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl
                                               bg-white/5 hover:bg-white/10 text-sm font-medium text-slate-300
                                               transition-colors border border-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {test?.loading ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Zap className="w-3.5 h-3.5" />
                                    )}
                                    Test Connection
                                </button>

                                {test && !test.loading && (
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
                                        test.success
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-rose-500/10 text-rose-400'
                                    }`}>
                                        {test.success ? (
                                            <>
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Connected — {test.latencyMs}ms
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-3.5 h-3.5" />
                                                {test.error}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
