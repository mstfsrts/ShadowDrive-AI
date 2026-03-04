// ─── Auth Routes ───
// POST /api/auth/register — create user
// POST /api/auth/login — verify credentials, return JWT
// GET  /api/auth/me — return current user from JWT

import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../services/prisma";
import { signToken, requireAuth, AuthRequest } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";

export const authRouter = Router();

// ─── Register ───
authRouter.post("/register", authLimiter, async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ error: "Email already registered" });
            return;
        }

        // Hash password and create user
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { email, passwordHash, name: name || null },
        });

        const token = signToken({ userId: user.id, email: user.email });

        console.log(`[Auth] ✅ User registered: ${email}`);

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt.toISOString(),
            },
        });
    } catch (error) {
        console.error("[Auth] Register error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
});

// ─── Login ───
authRouter.post("/login", authLimiter, async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        const token = signToken({ userId: user.id, email: user.email });

        console.log(`[Auth] ✅ User logged in: ${email}`);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt.toISOString(),
            },
        });
    } catch (error) {
        console.error("[Auth] Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

// ─── Get Current User ───
authRouter.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: { id: true, email: true, name: true, createdAt: true },
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt.toISOString(),
        });
    } catch (error) {
        console.error("[Auth] Me error:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});
