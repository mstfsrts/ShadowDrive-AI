"use client";

// ─── ShadowDrive AI — Profile Page ───
// User stats, goals, recent lessons, pronunciation trends.

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ProfileStats, UserGoalData } from "@/types/dialogue";
import PronunciationCard from "@/components/PronunciationCard";

interface RecentLesson {
    lessonType: string;
    lessonId: string;
    lessonTitle: string;
    averageScore: number;
    createdAt: string;
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const t = useTranslations('profile');
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [goals, setGoals] = useState<UserGoalData | null>(null);
    const [recentLessons, setRecentLessons] = useState<RecentLesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingGoal, setEditingGoal] = useState(false);
    const [goalInput, setGoalInput] = useState(2);

    const fetchProfile = useCallback(async () => {
        try {
            const [statsRes, goalsRes, lessonsRes] = await Promise.all([
                fetch("/api/profile/stats"),
                fetch("/api/profile/goals"),
                fetch("/api/profile/recent-lessons"),
            ]);
            if (statsRes.ok) setStats(await statsRes.json());
            if (goalsRes.ok) {
                const g = await goalsRes.json();
                setGoals(g);
                setGoalInput(g.dailyTarget);
            }
            if (lessonsRes.ok) setRecentLessons(await lessonsRes.json());
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session?.user) fetchProfile();
        else setLoading(false);
    }, [session, fetchProfile]);

    const saveGoal = useCallback(async () => {
        try {
            const res = await fetch("/api/profile/goals", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dailyTarget: goalInput, weeklyTarget: goalInput * 5 }),
            });
            if (res.ok) {
                setGoals(await res.json());
                setEditingGoal(false);
            }
        } catch {
            // silent
        }
    }, [goalInput]);

    if (!session?.user) {
        return (
            <main className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
                <h1 className="text-xl font-bold text-foreground mb-6">{t('title')}</h1>
                <div className="flex flex-col items-center justify-center py-20">
                    <span className="text-5xl mb-4">👤</span>
                    <p className="text-foreground-secondary text-lg text-center">
                        {t('loginRequired')}
                    </p>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
                <h1 className="text-xl font-bold text-foreground mb-6">{t('title')}</h1>
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
            </main>
        );
    }

    const user = session.user;

    return (
        <main className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-6">{t('title')}</h1>
        <div className="flex flex-col gap-6 pb-8">
            {/* User Info Card */}
            <section className="bg-card border border-border/50 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                    {user.image ? (
                        <img
                            src={user.image}
                            alt=""
                            className="w-14 h-14 rounded-full border-2 border-border"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/25 flex items-center justify-center text-2xl">
                            👤
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-foreground font-bold text-lg truncate">{user.name || t('defaultUser')}</p>
                        <p className="text-foreground-muted text-sm truncate">{user.email}</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/profile/settings')}
                        className="flex items-center justify-center w-10 h-10 rounded-xl
                                   bg-card-hover border border-border/50 text-foreground-muted
                                   hover:text-foreground hover:border-border-hover transition-all"
                        title={t('settingsTitle') || 'Settings'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* Stats Grid */}
            {stats && (
                <section>
                    <h2 className="text-foreground-muted text-xs font-bold uppercase tracking-wider mb-3">
                        {t('stats')}
                    </h2>
                    <div className="grid grid-cols-3 gap-2.5">
                        <StatCard value={stats.completedLessons} label={t('completed')} icon="📚" />
                        <StatCard value={stats.masteredLessons} label={t('mastered')} icon="🎓" />
                        <StatCard
                            value={stats.pronunciationScore > 0 ? `${Math.round(stats.pronunciationScore)}%` : "—"}
                            label={t('pronunciation')}
                            icon="🎤"
                        />
                        <StatCard value={stats.dailyStreak} label={t('dailyStreak')} icon="🔥" />
                        <StatCard value={stats.totalRepetitions} label={t('totalRepetitions')} icon="🔄" />
                        <StatCard value={stats.aiLessons} label={t('aiLessons')} icon="🤖" />
                    </div>
                </section>
            )}

            {/* Goals */}
            <section>
                <h2 className="text-foreground-muted text-xs font-bold uppercase tracking-wider mb-3">
                    {t('goals')}
                </h2>
                <div className="bg-card border border-border/50 rounded-2xl p-4">
                    {editingGoal ? (
                        <GoalEditor
                            value={goalInput}
                            onChange={setGoalInput}
                            onSave={saveGoal}
                            onCancel={() => setEditingGoal(false)}
                        />
                    ) : goals ? (
                        <div className="flex flex-col gap-3">
                            <GoalProgress
                                label={t('dailyGoal')}
                                current={goals.todayCount}
                                target={goals.dailyTarget}
                            />
                            <GoalProgress
                                label={t('weeklyGoal')}
                                current={goals.weekCount}
                                target={goals.weeklyTarget}
                            />
                            <button
                                onClick={() => setEditingGoal(true)}
                                className="text-emerald-500 text-sm font-medium mt-1 hover:text-emerald-400 transition-colors self-start"
                            >
                                {t('editGoal')}
                            </button>
                            <MotivationMessage goals={goals} streak={stats?.dailyStreak ?? 0} />
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditingGoal(true)}
                            className="w-full py-3 text-emerald-500 font-semibold text-sm"
                        >
                            🎯 {t('setGoal')}
                        </button>
                    )}
                </div>
            </section>

            {/* Recent Lessons */}
            {recentLessons.length > 0 && (
                <section>
                    <h2 className="text-foreground-muted text-xs font-bold uppercase tracking-wider mb-3">
                        {t('recentLessons')}
                    </h2>
                    <div className="flex flex-col gap-2">
                        {recentLessons.map((lesson, idx) => (
                            <div key={idx} className="bg-card border border-border/50 rounded-2xl px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-lg">
                                        {lesson.lessonType === "course" ? "📚" : lesson.lessonType === "ai" ? "🤖" : "✏️"}
                                    </span>
                                    <p className="text-foreground text-sm font-medium truncate">{lesson.lessonTitle}</p>
                                </div>
                                <ScoreBadge score={lesson.averageScore} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Pronunciation Tracking */}
            <PronunciationCard />

            {/* Recordings Link */}
            <button
                onClick={() => router.push('/dashboard/profile/recordings')}
                className="bg-card border border-border/50 rounded-2xl px-5 py-4 flex items-center justify-between
                           hover:border-border-hover transition-all w-full text-left"
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">🎙️</span>
                    <span className="text-foreground font-medium text-sm">{t('recordings')}</span>
                </div>
                <span className="text-foreground-faint text-lg">→</span>
            </button>
        </div>
        </main>
    );
}

// ─── Sub Components ───

function StatCard({ value, label, icon }: { value: number | string; label: string; icon: string }) {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-3 text-center">
            <span className="text-lg">{icon}</span>
            <p className="text-foreground font-bold text-xl mt-1">{value}</p>
            <p className="text-foreground-muted text-xs mt-0.5">{label}</p>
        </div>
    );
}

function GoalProgress({ label, current, target }: { label: string; current: number; target: number }) {
    const pct = Math.min(100, target > 0 ? (current / target) * 100 : 0);
    const done = current >= target;

    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground-secondary">{label}</span>
                <span className={done ? "text-emerald-500 font-bold" : "text-foreground-muted"}>
                    {current}/{target}
                </span>
            </div>
            <div className="w-full h-2 bg-card-hover rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${done ? "bg-emerald-500" : "bg-emerald-500/60"}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function GoalEditor({
    value,
    onChange,
    onSave,
    onCancel,
}: {
    value: number;
    onChange: (v: number) => void;
    onSave: () => void;
    onCancel: () => void;
}) {
    const t = useTranslations('profile');
    const tc = useTranslations('common');

    const presets = [
        { n: 1, emoji: "🌱", label: t('goalEasy') },
        { n: 2, emoji: "🌿", label: t('goalBalanced') },
        { n: 3, emoji: "🌳", label: t('goalDetermined') },
    ];

    return (
        <div className="flex flex-col gap-4">
            <p className="text-foreground font-semibold text-sm">{t('goalQuestion')}</p>
            <div className="grid grid-cols-3 gap-2">
                {presets.map(p => (
                    <button
                        key={p.n}
                        onClick={() => onChange(p.n)}
                        className={`py-3 rounded-xl border text-center transition-all
                            ${value === p.n
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                                : "border-border bg-card-hover text-foreground-secondary hover:border-border-hover"
                            }`}
                    >
                        <span className="text-xl block">{p.emoji}</span>
                        <span className="text-xs font-medium block mt-1">{p.n} ders</span>
                        <span className="text-xs text-foreground-muted block">{p.label}</span>
                    </button>
                ))}
            </div>
            <p className="text-foreground-muted text-xs leading-relaxed">
                💡 {t('goalTip')}
            </p>
            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl border border-border text-foreground-secondary text-sm font-medium hover:border-border-hover transition-colors"
                >
                    {tc('cancel')}
                </button>
                <button
                    onClick={onSave}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-400 transition-colors"
                >
                    {tc('save')}
                </button>
            </div>
        </div>
    );
}

function MotivationMessage({ goals, streak }: { goals: UserGoalData; streak: number }) {
    const tg = useTranslations('goals');
    let message = "";

    if (goals.todayCount >= goals.dailyTarget * 1.5) {
        message = tg('exceeded', { count: goals.todayCount, target: goals.dailyTarget });
    } else if (goals.todayCount >= goals.dailyTarget) {
        message = tg('reached');
    } else if (goals.todayCount >= goals.dailyTarget / 2) {
        const remaining = goals.dailyTarget - goals.todayCount;
        message = tg('halfway', { remaining });
    } else if (goals.todayCount === 0) {
        message = tg('newDay');
    }

    // Streak messages override
    if (streak >= 30) {
        message = tg('streak30');
    } else if (streak >= 7) {
        message = tg('streak7');
    } else if (streak >= 3 && goals.todayCount > 0) {
        message = tg('streak3', { count: streak });
    }

    if (!message) return null;

    return (
        <p className="text-foreground-secondary text-xs leading-relaxed bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2 mt-1">
            {message}
        </p>
    );
}

function ScoreBadge({ score }: { score: number }) {
    if (score <= 0) return null;
    const pct = Math.round(score * 100);
    const color = pct >= 70
        ? "text-emerald-600 dark:text-emerald-400"
        : pct >= 40
            ? "text-amber-600 dark:text-amber-400"
            : "text-red-600 dark:text-red-400";
    const icon = pct >= 70 ? "✅" : pct >= 40 ? "⚠️" : "❌";

    return (
        <span className={`text-sm font-bold ${color} flex-shrink-0`}>
            {icon} {pct}%
        </span>
    );
}
