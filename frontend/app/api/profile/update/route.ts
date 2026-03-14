// PATCH /api/profile/update — Update user name and/or image
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    if (!prisma) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    try {
        const { name, image } = await request.json();

        const updateData: Record<string, string> = {};
        if (typeof name === "string" && name.trim()) {
            updateData.name = name.trim().slice(0, 100);
        }
        if (typeof image === "string") {
            updateData.image = image.slice(0, 500);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const updated = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: { id: true, name: true, email: true, image: true },
        });

        return NextResponse.json(updated);
    } catch (e) {
        console.error("[profile/update] error:", e);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
