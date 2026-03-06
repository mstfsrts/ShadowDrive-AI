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
                <input
                    type="password"
                    placeholder="En az 8 karakter"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-xl bg-card-hover border border-border text-foreground placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
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
