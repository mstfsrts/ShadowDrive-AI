import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminActivityPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center h-[60vh]">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4">
                <Activity className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Activity Logs</h1>
            <p className="text-slate-400 text-center max-w-md">
                This module will display real-time events, API requests, and user completions. Currently under construction for Phase E.
            </p>
        </div>
    );
}
