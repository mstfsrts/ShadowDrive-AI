// ─── ShadowDrive AI — Auth Middleware ───
// Defense-in-depth: protects routes at the edge before server components run.
// - Authenticated user hitting "/" → redirect to /dashboard
// - All other routes → pass through (dashboard allows guest access by design)

import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const { pathname } = req.nextUrl;

    // Authenticated user trying to access landing page → redirect to dashboard
    if (pathname === '/' && req.auth?.user) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
});

export const config = {
    // Run middleware only on specific routes (skip API, static, etc.)
    matcher: ['/'],
};
