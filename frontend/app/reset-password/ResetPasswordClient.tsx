"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordClient() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token");
    const emailStr = searchParams.get("email");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (emailStr) setEmail(emailStr);
    }, [emailStr]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Geçersiz veya eksik token. Lütfen e-postanızdaki bağlantıya tekrar tıklayın.");
            return;
        }

        if (password.length < 8) {
            setError("Şifre en az 8 karakter olmalıdır.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token, newPassword: password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Şifre sıfırlanamadı.");
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/");
                }, 3000);
            }
        } catch {
            setError("Bağlantı hatası.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center">
                <div className="text-emerald-500 text-5xl mb-4">✓</div>
                <h2 className="text-2xl font-bold mb-2">Başarılı!</h2>
                <p className="text-foreground-secondary mb-6">Şifreniz güncellendi. Giriş sayfasına yönlendiriliyorsunuz...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">E-posta</label>
                <input type="email" value={email} disabled className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground-muted cursor-not-allowed" />
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">Yeni Şifre</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="En az 8 karakter"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-card-hover border border-border text-foreground placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted
                                   hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                        {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 rounded-2xl bg-emerald-500 text-white font-bold text-base hover:bg-emerald-400 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
            >
                {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
        </form>
    );
}
