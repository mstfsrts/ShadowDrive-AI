import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

// ─── ShadowDrive AI — Password Reset Endpoint ───
// POST /api/auth/reset-password  →  { email }

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body as { email?: string };

        if (!email) {
            return NextResponse.json({ error: "E-posta adresi gereklidir." }, { status: 400 });
        }

        const prisma = getPrisma();
        if (!prisma) {
            return NextResponse.json({ error: "Veritabanı bağlantı hatası." }, { status: 500 });
        }

        // 1. Verify user exists and is a credentials user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Security best practice: Don't leak whether the email exists for arbitrary strings.
        // However, if the user ACTUALLY exists but has no password (Google Auth), we should tell them.
        if (!user) {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate work
            return NextResponse.json({
                message: `Şifre sıfırlama bağlantısı ${email} adresine başarıyla gönderildi. (Gelen kutunuzu kontrol edin)`,
            });
        }

        if (user && !user.passwordHash) {
            return NextResponse.json(
                {
                    error: `Bu e-posta adresi Google hesabı ile bağlanmış. Lütfen "Google ile Başla" butonunu kullanarak giriş yapın.`,
                },
                { status: 400 },
            );
        }

        // 2. Generate a secure random crypto token
        const rawToken = crypto.randomBytes(32).toString("hex");

        // Hash it for DB storage
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        const tokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 Hour

        // 3. Save to DB
        await prisma.user.update({
            where: { email },
            data: {
                resetToken: hashedToken,
                resetTokenExpiry: tokenExpires,
            },
        });

        // 4. Construct URL
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const resetUrl = `${protocol}://${host}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

        // 5. Send Email via Resend
        const emailResult = await sendPasswordResetEmail(email, resetUrl);

        if (!emailResult.success) {
            console.error("[Reset Password] Failed to send email", emailResult.error);
        } else {
            console.log(`[Reset Password] Email sent to ${email}`);
        }

        return NextResponse.json({
            message: `Şifre sıfırlama bağlantısı ${email} adresine başarıyla gönderildi. (Gelen kutunuzu kontrol edin)`,
        });
    } catch (error) {
        console.error("[Reset Password API]", error);
        return NextResponse.json({ error: "Bir hata oluştu. Lütfen tekrar deneyin." }, { status: 500 });
    }
}
