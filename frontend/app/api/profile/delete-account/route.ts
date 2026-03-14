// DELETE /api/profile/delete-account — Delete user account (cascading)
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    try {
        const { confirmation } = await request.json();

        if (confirmation !== "DELETE") {
            return NextResponse.json({ error: "Type DELETE to confirm account deletion" }, { status: 400 });
        }

        // Cascade delete handles all related records (Progress, PronunciationAttempt, etc.)
        await prisma.user.delete({ where: { id: session.user.id } });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("[profile/delete-account] error:", e);
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }
}
