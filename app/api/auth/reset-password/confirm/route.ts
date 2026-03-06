import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// ─── ShadowDrive AI — Confirm Password Reset Endpoint ───
// POST /api/auth/reset-password/confirm  →  { email, token, newPassword }

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, token, newPassword } = body as { email?: string; token?: string; newPassword?: string };

        if (!email || !token || !newPassword) {
            return NextResponse.json({ error: "Eksik bilgi gönderildi." }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "Şifre en az 8 karakter olmalıdır." }, { status: 400 });
        }

        const prisma = getPrisma();
        if (!prisma) {
            return NextResponse.json({ error: "Veritabanı bağlantı hatası." }, { status: 500 });
        }

        // 1. Find User
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.resetToken || !user.resetTokenExpiry) {
            return NextResponse.json({ error: "Geçersiz veya süresi dolmuş bağlantı." }, { status: 400 });
        }

        // 2. Check Expiry
        if (new Date() > user.resetTokenExpiry) {
            return NextResponse.json({ error: "Bu bağlantının süresi dolmuş." }, { status: 400 });
        }

        // 3. Verify Token
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        if (user.resetToken !== hashedToken) {
            return NextResponse.json({ error: "Geçersiz bağlantı." }, { status: 400 });
        }

        // 4. Hash New Password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // 5. Update User and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return NextResponse.json({ success: true, message: "Şifre başarıyla güncellendi." });
    } catch (error) {
        console.error("[Reset Password Confirm API]", error);
        return NextResponse.json({ error: "Bir hata oluştu. Lütfen tekrar deneyin." }, { status: 500 });
    }
}
