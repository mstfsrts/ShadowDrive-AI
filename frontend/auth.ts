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

            return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
        },
    })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: getAdapter(),
    session: { strategy: 'jwt' },
    providers,
    callbacks: {
        async signIn({ user, account, profile }) {
            // On Google OAuth, sync the User record's email/name/image with
            // the Google profile. Prevents stale data when a Google Account
            // record was linked to the wrong User (e.g. after account deletion
            // and re-registration).
            if (account?.provider === 'google' && profile?.email && user?.id) {
                const prisma = getPrisma();
                if (prisma) {
                    try {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                email: profile.email,
                                name: profile.name || user.name,
                                image: (profile as { picture?: string }).picture || user.image,
                            },
                        });
                    } catch {
                        // Non-critical — don't block sign-in
                    }
                }
            }
            return true;
        },
        async jwt({ token, user, account, profile, trigger }) {
            if (user) {
                token.id = user.id;
                // For Google login, use profile email (most up-to-date)
                token.email = (account?.provider === 'google' && profile?.email)
                    ? profile.email
                    : user.email;
                token.name = user.name;
                token.picture = user.image;

                // Read from ENV to dynamically grant Admin rights
                if (
                    user.email &&
                    process.env.ADMIN_EMAIL &&
                    user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
                ) {
                    token.role = 'ADMIN';
                } else {
                    token.role = user.role || 'USER';
                }
            }

            // Refresh user data from DB when session is updated (e.g., after name change)
            if (trigger === 'update' && token.id) {
                const prisma = getPrisma();
                if (prisma) {
                    const freshUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: { name: true, email: true, image: true, role: true },
                    });
                    if (freshUser) {
                        token.name = freshUser.name;
                        token.picture = freshUser.image;
                        if (
                            token.email &&
                            process.env.ADMIN_EMAIL &&
                            (token.email as string).toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
                        ) {
                            token.role = 'ADMIN';
                        } else {
                            token.role = freshUser.role || 'USER';
                        }
                    }
                }
            }

            return token;
        },
        session({ session, token }) {
            if (token.id && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.picture as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/', // Modal-based auth — no separate login page
        error: '/',
    },
});
