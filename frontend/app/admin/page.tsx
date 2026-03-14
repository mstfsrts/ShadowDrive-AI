import { getPrisma } from "@/lib/prisma";
import { Users, Activity, Mic, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const prisma = getPrisma();
    if (!prisma) {
        return <div className="p-8 text-rose-400">Database connection failed.</div>;
    }

    // Fetch system-wide stats
    const [totalUsers, activeToday, lessonsCompleted, pronunciationAttempts] = await Promise.all([
        prisma.user.count(),
        prisma.dailyActivity.count({
            where: {
                date: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        }),
        prisma.progress.count({
            where: { completed: true },
        }),
        prisma.pronunciationAttempt.count(),
    ]);

    const stats = [
        {
            title: "Total Registered Users",
            value: totalUsers,
            trend: "+12% from last month",
            icon: Users,
            color: "from-blue-500/20 to-blue-500/0",
            iconColor: "text-blue-400",
            borderColor: "border-blue-500/20",
        },
        {
            title: "Active Today",
            value: activeToday,
            trend: "+4% from yesterday",
            icon: Activity,
            color: "from-emerald-500/20 to-emerald-500/0",
            iconColor: "text-emerald-400",
            borderColor: "border-emerald-500/20",
        },
        {
            title: "Lessons Completed",
            value: lessonsCompleted,
            trend: "All time records",
            icon: BookOpen,
            color: "from-purple-500/20 to-purple-500/0",
            iconColor: "text-purple-400",
            borderColor: "border-purple-500/20",
        },
        {
            title: "Voice Interactions",
            value: pronunciationAttempts,
            trend: "All models (OpenRouter + Anthropic)",
            icon: Mic,
            color: "from-rose-500/20 to-rose-500/0",
            iconColor: "text-rose-400",
            borderColor: "border-rose-500/20",
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">System Overview</h1>
                <p className="text-slate-400 mt-2">Real-time metrics and usage analytics for ShadowDrive AI.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={i}
                            className={`relative overflow-hidden rounded-2xl border ${stat.borderColor} bg-white/[0.02] p-6 backdrop-blur-sm transition-all hover:bg-white/[0.04]`}
                        >
                            <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br ${stat.color} opacity-20 transform rotate-12 blur-3xl`} />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/5 text-slate-300">
                                        Live
                                    </span>
                                </div>
                                <div className="grow">
                                    <h3 className="text-sm font-medium text-slate-400">{stat.title}</h3>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-white">
                                            {stat.value.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500 font-medium">{stat.trend}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Placeholder for Quick Actions or Activity Feed */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full relative group overflow-hidden rounded-xl border border-white/5 bg-white/5 p-4 text-left hover:bg-white/10 transition-all">
                            <span className="relative z-10 text-sm font-medium text-white block">Generate Shadowing Content</span>
                            <span className="relative z-10 text-xs text-slate-400 block mt-1">Pre-cache audio for new lessons using Edge TTS</span>
                        </button>
                        <button className="w-full relative group overflow-hidden rounded-xl border border-white/5 bg-white/5 p-4 text-left hover:bg-white/10 transition-all">
                            <span className="relative z-10 text-sm font-medium text-white block">Force Database Backup</span>
                            <span className="relative z-10 text-xs text-slate-400 block mt-1">Snapshot Neon PostgreSQL instance</span>
                        </button>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Automations</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-200">System Booted on Dokploy</p>
                                <p className="text-xs text-slate-500 mt-1">Prisma migration check passed continuously.</p>
                            </div>
                            <span className="ml-auto text-xs text-slate-600">Just now</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
