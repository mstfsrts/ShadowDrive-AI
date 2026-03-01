// ─── NextAuth v5 Type Augmentation ───
// Adds `session.user.id` to the TypeScript session type.

import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
        } & DefaultSession['user'];
    }
}
