// PATCH /api/admin/users/role — Toggle user role (admin-only)
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    try {
        const { userId, role } = await request.json();

        if (!userId || !["USER", "ADMIN"].includes(role)) {
            return NextResponse.json({ error: "Invalid userId or role" }, { status: 400 });
        }

        // Prevent admin from removing their own admin role
        if (userId === session.user.id && role === "USER") {
            return NextResponse.json({ error: "Cannot remove your own admin role" }, { status: 400 });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: { id: true, role: true, name: true, email: true },
        });

        return NextResponse.json(updated);
    } catch (e) {
        console.error("[admin/users/role] PATCH error:", e);
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
}
