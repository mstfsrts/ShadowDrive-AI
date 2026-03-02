'use client';

// ─── ShadowDrive AI — Auth Button ───
// Shows login state in the hero section.
// - Guest: "Giriş Yap" button → opens AuthModal
// - Logged in: avatar + first name + dropdown with sign out

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import AuthModal from './AuthModal';

export default function AuthButton() {
    const { data: session, status } = useSession();
    const [showModal, setShowModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    // Don't render until session is resolved (avoids flash)
    if (status === 'loading') {
        return <div className="w-11 h-11 rounded-full bg-card-hover animate-pulse" />;
    }

    if (session?.user) {
        const user = session.user;
        const initials = user.name
            ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
            : user.email?.[0]?.toUpperCase() ?? '?';

        return (
            <div className="relative flex-shrink-0">
                <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 active:scale-95 overflow-hidden border-0 p-0"
                    title={user.name ?? user.email ?? 'Profil'}
                    aria-label={user.name ?? user.email ?? 'Profil menüsü'}
                >
                    {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={user.image}
                            alt=""
                            className="w-full h-full object-cover rounded-full border border-border"
                        />
                    ) : (
                        <span className="w-full h-full rounded-full bg-emerald-500/20 border border-emerald-500/40
                                        flex items-center justify-center text-emerald-600 dark:text-emerald-400
                                        text-sm font-bold overflow-hidden truncate">
                            {initials}
                        </span>
                    )}
                </button>

                {showDropdown && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowDropdown(false)}
                        />
                        <div className="absolute left-0 top-12 z-20 bg-card border border-border
                                        rounded-2xl shadow-2xl p-3 min-w-[180px] animate-fade-in">
                            <p className="text-foreground text-sm font-medium px-2 py-1 truncate max-w-[140px]">
                                {user.name || user.email}
                            </p>
                            <div className="h-px bg-border my-2" />
                            <button
                                onClick={() => { signOut(); setShowDropdown(false); }}
                                className="w-full text-left px-2 py-2 text-sm text-red-500 dark:text-red-400
                                           hover:bg-card-hover rounded-xl transition-colors duration-200"
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                           bg-card-hover border border-border hover:border-border-hover
                           text-foreground-secondary hover:text-foreground
                           text-sm font-medium transition-all duration-200 active:scale-95 min-h-[44px]"
            >
                <span className="text-base">👤</span>
                <span>Giriş</span>
            </button>

            <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    );
}
