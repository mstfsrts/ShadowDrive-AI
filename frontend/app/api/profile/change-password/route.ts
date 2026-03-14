// POST /api/profile/change-password — Change password (credentials users only)
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Both current and new passwords are required" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { passwordHash: true },
        });

        if (!user?.passwordHash) {
            return NextResponse.json({ error: "Password change not available for OAuth accounts" }, { status: 400 });
        }

        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }

        const newHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: session.user.id },
            data: { passwordHash: newHash },
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("[profile/change-password] error:", e);
        return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
    }
}
