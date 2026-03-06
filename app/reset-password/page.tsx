import ResetPasswordClient from "./ResetPasswordClient";
import { Suspense } from "react";

export const metadata = {
    title: "Şifre Sıfırlama | ShadowDrive AI",
};

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl">
                <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-center">Yeni Şifre</h1>
                <p className="text-foreground-secondary text-center mb-8">Lütfen yeni şifrenizi belirleyin.</p>
                <Suspense fallback={<div className="text-center text-foreground-muted">Yükleniyor...</div>}>
                    <ResetPasswordClient />
                </Suspense>
            </div>
        </div>
    );
}
