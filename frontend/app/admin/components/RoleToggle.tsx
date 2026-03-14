'use client';

import { useState } from 'react';
import { Shield, User as UserIcon, Loader2 } from 'lucide-react';

interface RoleToggleProps {
    userId: string;
    currentRole: string;
}

export function RoleToggle({ userId, currentRole }: RoleToggleProps) {
    const [role, setRole] = useState(currentRole);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        const newRole = role === 'ADMIN' ? 'USER' : 'ADMIN';
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users/role', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });
            if (res.ok) {
                const data = await res.json();
                setRole(data.role);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-400 border border-white/10">
                <Loader2 className="w-3 h-3 animate-spin" />
                Updating...
            </span>
        );
    }

    return (
        <button
            onClick={handleToggle}
            className="group"
            title={`Click to change to ${role === 'ADMIN' ? 'User' : 'Admin'}`}
        >
            {role === 'ADMIN' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors cursor-pointer">
                    <Shield className="w-3 h-3" />
                    Admin
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20 group-hover:bg-slate-500/20 transition-colors cursor-pointer">
                    <UserIcon className="w-3 h-3" />
                    User
                </span>
            )}
        </button>
    );
}
