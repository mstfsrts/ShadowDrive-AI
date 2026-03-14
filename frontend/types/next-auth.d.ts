// ─── NextAuth v5 Type Augmentation ───
// Adds `session.user.id` to the TypeScript session type.

import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role?: string;
        } & DefaultSession['user'];
    }
    interface User extends DefaultUser {
        role?: string;
    }
}
