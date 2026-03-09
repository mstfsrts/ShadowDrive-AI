// ─── Backend Token Endpoint ───
// Returns a JWT compatible with Express backend from current NextAuth session.
// GET /api/auth/backend-token → { token: "..." }

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { SignJWT } from "jose";

const BACKEND_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-change-in-production";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id || !session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Sign a JWT that Express backend can verify (uses same secret)
    const secret = new TextEncoder().encode(BACKEND_SECRET);
    const token = await new SignJWT({
        userId: session.user.id,
        email: session.user.email,
        sub: session.user.id,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("24h")
        .setIssuedAt()
        .sign(secret);

    return NextResponse.json({ token });
}
