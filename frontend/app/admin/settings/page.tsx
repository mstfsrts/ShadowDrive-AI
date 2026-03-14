import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-2">System Settings</h1>
                <p className="text-sm text-slate-400">Configure global platform variables and AI models.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <Settings className="w-5 h-5 text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">LLM Configuration</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Primary Inference Model</label>
                            <select className="w-full bg-[#05080f] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none">
                                <option>google/gemini-2.5-flash</option>
                                <option>anthropic/claude-3-haiku</option>
                                <option>openai/gpt-4o-mini</option>
                            </select>
                        </div>
                        <div className="pt-2">
                            <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors border border-white/10 w-full opacity-50 cursor-not-allowed">
                                Save Configuration (Coming in Phase E)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
