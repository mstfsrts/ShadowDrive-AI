// ─── JWT Auth Middleware ───
// Supports both:
// 1. Backend's own JWT tokens (userId + email)
// 2. NextAuth JWT forwarding (sub = userId)

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
    userId: string; // cuid from PostgreSQL
    email: string;
}

export interface AuthRequest extends Request {
    user?: AuthPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production";

export function signToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): AuthPayload {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;

    // Handle NextAuth JWT format (uses 'sub' for userId)
    const userId = (decoded.userId as string) || (decoded.sub as string) || "";
    const email = (decoded.email as string) || "";

    return { userId, email };
}

/**
 * Middleware: requires valid JWT in Authorization header.
 * Attaches `req.user` with { userId, email }.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid Authorization header" });
        return;
    }

    const token = header.slice(7);

    try {
        const payload = verifyToken(token);
        if (!payload.userId) {
            res.status(401).json({ error: "Invalid token: missing user ID" });
            return;
        }
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

/**
 * Middleware: optional auth — attaches user if token present, continues regardless.
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;

    if (header && header.startsWith("Bearer ")) {
        try {
            const payload = verifyToken(header.slice(7));
            if (payload.userId) {
                req.user = payload;
            }
        } catch {
            // Token invalid — continue without user
        }
    }

    next();
}
