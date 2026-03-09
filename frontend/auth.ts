// ─── ShadowDrive AI — NextAuth v5 Configuration ───
// Supports: Google OAuth + Email/Password (Credentials)
// Strategy: JWT (sessions stored in cookie, no DB required for auth itself)
// Adapter: PrismaAdapter (only if DATABASE_URL is set)

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getPrisma } from '@/lib/prisma';

// Lazily create adapter only if DB is available
function getAdapter() {
    const prisma = getPrisma();
    if (!prisma) return undefined;

    // Dynamically require to avoid import-time crash when DB is unavailable
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaAdapter } = require('@auth/prisma-adapter');
    return PrismaAdapter(prisma);
}

const providers = [];

// Google OAuth — only if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    );
}

// Email + Password — always available
providers.push(
    Credentials({
        credentials: {
            email: { type: 'email' },
            password: { type: 'password' },
        },
        async authorize(credentials) {
            const prisma = getPrisma();
            if (!prisma) return null;

            const email = credentials?.email as string | undefined;
            const password = credentials?.password as string | undefined;

            if (!email || !password) return null;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user?.passwordHash) return null;

            const valid = await bcrypt.compare(password, user.passwordHash);
            if (!valid) return null;

            return { id: user.id, email: user.email, name: user.name, image: user.image };
        },
    })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: getAdapter(),
    session: { strategy: 'jwt' },
    providers,
    callbacks: {
        jwt({ token, user }) {
            if (user?.id) token.id = user.id;
            return token;
        },
        session({ session, token }) {
            if (token.id && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/', // Modal-based auth — no separate login page
        error: '/',
    },
});
