'use client';

// ─── /dashboard/profile/settings — Profile Settings Page ───

import { useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { clearBackendToken } from '@/lib/backendFetch';

export default function ProfileSettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const router = useRouter();
    const t = useTranslations('settings');
    const tc = useTranslations('common');

    const [name, setName] = useState(session?.user?.name || '');
    const [savingName, setSavingName] = useState(false);
    const [nameMsg, setNameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPw, setSavingPw] = useState(false);
    const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteMsg, setDeleteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const isOAuth = !session?.user?.email || session.user.image?.includes('googleusercontent');

    const handleSaveName = useCallback(async () => {
        if (!name.trim()) return;
        setSavingName(true);
        setNameMsg(null);
        try {
            const res = await fetch('/api/profile/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            });
            if (res.ok) {
                setNameMsg({ type: 'success', text: t('nameSaved') });
                await updateSession({ name: name.trim() });
                router.refresh();
            } else {
                const data = await res.json();
                setNameMsg({ type: 'error', text: data.error || t('saveFailed') });
            }
        } catch {
            setNameMsg({ type: 'error', text: t('saveFailed') });
        } finally {
            setSavingName(false);
            setTimeout(() => setNameMsg(null), 3000);
        }
    }, [name, t, updateSession, router]);

    const handleChangePassword = useCallback(async () => {
        setPwMsg(null);
        if (newPassword.length < 8) {
            setPwMsg({ type: 'error', text: t('passwordMinLength') });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwMsg({ type: 'error', text: t('passwordMismatch') });
            return;
        }
        setSavingPw(true);
        try {
            const res = await fetch('/api/profile/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            if (res.ok) {
                setPwMsg({ type: 'success', text: t('passwordChanged') });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const data = await res.json();
                setPwMsg({ type: 'error', text: data.error || t('saveFailed') });
            }
        } catch {
            setPwMsg({ type: 'error', text: t('saveFailed') });
        } finally {
            setSavingPw(false);
            setTimeout(() => setPwMsg(null), 4000);
        }
    }, [currentPassword, newPassword, confirmPassword, t]);

    const handleDeleteAccount = useCallback(async () => {
        if (deleteConfirm !== 'DELETE') return;
        setDeleting(true);
        setDeleteMsg(null);
        try {
            const res = await fetch('/api/profile/delete-account', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirmation: 'DELETE' }),
            });
            if (res.ok) {
                clearBackendToken();
                signOut({ callbackUrl: '/' });
            } else {
                const data = await res.json();
                setDeleteMsg({ type: 'error', text: data.error || t('deleteFailed') });
            }
        } catch {
            setDeleteMsg({ type: 'error', text: t('deleteFailed') });
        } finally {
            setDeleting(false);
        }
    }, [deleteConfirm, t]);

    if (!session?.user) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center px-4">
                <p className="text-foreground-secondary text-lg">{t('loginRequired')}</p>
            </main>
        );
    }

    return (
        <main className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-foreground-muted hover:text-foreground transition-colors text-xl"
                >
                    ←
                </button>
                <h1 className="text-xl font-bold text-foreground">{t('title')}</h1>
            </div>

            <div className="flex flex-col gap-6 pb-8">
                {/* Display Name */}
                <section className="bg-card border border-border/50 rounded-2xl p-5">
                    <h2 className="text-foreground font-semibold text-sm mb-4">{t('displayName')}</h2>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('namePlaceholder')}
                        className="w-full px-4 py-3 rounded-xl bg-card-hover border border-border text-foreground
                                   placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-base"
                    />
                    {nameMsg && (
                        <p className={`text-sm mt-2 ${nameMsg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {nameMsg.text}
                        </p>
                    )}
                    <button
                        onClick={handleSaveName}
                        disabled={savingName || !name.trim() || name === session.user.name}
                        className="mt-3 w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm
                                   hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {savingName ? tc('saving') : tc('save')}
                    </button>
                </section>

                {/* Change Password (only for credentials users) */}
                {!isOAuth && (
                    <section className="bg-card border border-border/50 rounded-2xl p-5">
                        <h2 className="text-foreground font-semibold text-sm mb-4">{t('changePassword')}</h2>
                        <div className="flex flex-col gap-3">
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder={t('currentPassword')}
                                className="w-full px-4 py-3 rounded-xl bg-card-hover border border-border text-foreground
                                           placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-base"
                            />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder={t('newPassword')}
                                minLength={8}
                                className="w-full px-4 py-3 rounded-xl bg-card-hover border border-border text-foreground
                                           placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-base"
                            />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t('confirmPassword')}
                                className="w-full px-4 py-3 rounded-xl bg-card-hover border border-border text-foreground
                                           placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-base"
                            />
                        </div>
                        {pwMsg && (
                            <p className={`text-sm mt-2 ${pwMsg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {pwMsg.text}
                            </p>
                        )}
                        <button
                            onClick={handleChangePassword}
                            disabled={savingPw || !currentPassword || !newPassword || !confirmPassword}
                            className="mt-3 w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm
                                       hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {savingPw ? tc('saving') : t('updatePassword')}
                        </button>
                    </section>
                )}

                {/* Danger Zone: Delete Account */}
                <section className="bg-card border border-red-500/20 rounded-2xl p-5">
                    <h2 className="text-red-500 dark:text-red-400 font-semibold text-sm mb-2">{t('dangerZone')}</h2>
                    <p className="text-foreground-muted text-xs mb-4 leading-relaxed">
                        {t('deleteWarning')}
                    </p>
                    <input
                        type="text"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder={t('typeDelete')}
                        className="w-full px-4 py-3 rounded-xl bg-card-hover border border-red-500/20 text-foreground
                                   placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-red-500/50 text-base"
                    />
                    {deleteMsg && (
                        <p className="text-sm mt-2 text-red-500">{deleteMsg.text}</p>
                    )}
                    <button
                        onClick={handleDeleteAccount}
                        disabled={deleting || deleteConfirm !== 'DELETE'}
                        className="mt-3 w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400
                                   font-semibold text-sm hover:bg-red-500/20 transition-colors
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {deleting ? tc('saving') : t('deleteAccount')}
                    </button>
                </section>
            </div>
        </main>
    );
}
