import { getPrisma } from "@/lib/prisma";
import { Activity, BookOpen, Mic, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
    const prisma = getPrisma();
    if (!prisma) return <div className="p-8 text-rose-400">Database connection failed.</div>;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
        dailyActivities,
        recentLessonReports,
        weeklyCompletions,
        monthlyPronunciations,
    ] = await Promise.all([
        prisma.dailyActivity.findMany({
            where: { date: { gte: sevenDaysAgo } },
            orderBy: { date: "desc" },
            include: { user: { select: { name: true, email: true } } },
            take: 50,
        }),
        prisma.lessonReport.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
            include: { user: { select: { name: true, email: true } } },
        }),
        prisma.progress.count({
            where: { completed: true, updatedAt: { gte: sevenDaysAgo } },
        }),
        prisma.pronunciationAttempt.count({
            where: { createdAt: { gte: thirtyDaysAgo } },
        }),
    ]);

    // Aggregate daily totals
    const dailyTotals = new Map<string, { lessons: number; minutes: number; users: number }>();
    for (const da of dailyActivities) {
        const dateKey = new Date(da.date).toLocaleDateString('en-CA');
        const existing = dailyTotals.get(dateKey) || { lessons: 0, minutes: 0, users: 0 };
        existing.lessons += da.lessonsCount;
        existing.minutes += da.practiceMinutes;
        existing.users += 1;
        dailyTotals.set(dateKey, existing);
    }

    const sortedDays = Array.from(dailyTotals.entries())
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 7);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Activity Logs</h1>
                <p className="text-sm text-slate-400">Real-time events, lesson completions, and user engagement metrics.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <BookOpen className="w-5 h-5 text-purple-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Weekly Completions</span>
                    </div>
                    <span className="text-3xl font-bold text-white">{weeklyCompletions}</span>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <Mic className="w-5 h-5 text-rose-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Monthly Voice</span>
                    </div>
                    <span className="text-3xl font-bold text-white">{monthlyPronunciations}</span>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Active Days (7d)</span>
                    </div>
                    <span className="text-3xl font-bold text-white">{sortedDays.length}</span>
                </div>
            </div>

            {/* Daily Activity Table */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-semibold text-white">Daily Activity (Last 7 Days)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-white/[0.02] border-b border-white/5">
                            <tr>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium text-right">Active Users</th>
                                <th className="px-6 py-3 font-medium text-right">Lessons</th>
                                <th className="px-6 py-3 font-medium text-right">Minutes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedDays.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-6 text-center text-slate-500">
                                        No activity recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                sortedDays.map(([date, totals]) => (
                                    <tr key={date} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-3 text-slate-300 font-medium">{date}</td>
                                        <td className="px-6 py-3 text-right text-slate-300">{totals.users}</td>
                                        <td className="px-6 py-3 text-right text-slate-300">{totals.lessons}</td>
                                        <td className="px-6 py-3 text-right text-slate-300">{totals.minutes}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Lesson Reports */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-semibold text-white">Recent Lesson Reports</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-white/[0.02] border-b border-white/5">
                            <tr>
                                <th className="px-6 py-3 font-medium">User</th>
                                <th className="px-6 py-3 font-medium">Lesson</th>
                                <th className="px-6 py-3 font-medium text-right">Score</th>
                                <th className="px-6 py-3 font-medium text-right">Correct</th>
                                <th className="px-6 py-3 font-medium text-right">When</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {recentLessonReports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                                        No lesson reports yet.
                                    </td>
                                </tr>
                            ) : (
                                recentLessonReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-3">
                                            <span className="text-slate-300">{report.user.name || report.user.email}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-slate-300">{report.lessonTitle}</span>
                                            <span className="text-xs text-slate-600 ml-2">{report.lessonType}</span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <span className={`font-medium ${
                                                report.averageScore >= 0.7 ? 'text-emerald-400'
                                                    : report.averageScore >= 0.4 ? 'text-amber-400'
                                                    : 'text-rose-400'
                                            }`}>
                                                {Math.round(report.averageScore * 100)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-slate-300">
                                            {report.correctCount}/{report.totalLines}
                                        </td>
                                        <td className="px-6 py-3 text-right text-slate-500 text-xs">
                                            {new Date(report.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
