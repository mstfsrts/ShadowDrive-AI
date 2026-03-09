'use client';

// ─── ShadowDrive AI — Client Providers ───
// Wraps the app in NextAuth SessionProvider.
// Must be a client component (useSession hook requires React context).

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}
