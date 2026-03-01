// ─── ShadowDrive AI — Root Page ───
// Server component: checks auth state.
// - Authenticated user  → redirect to /dashboard
// - Unauthenticated     → show landing page

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LandingPage from '@/components/LandingPage';

export default async function HomePage() {
    const session = await auth();
    if (session?.user) {
        redirect('/dashboard');
    }
    return <LandingPage />;
}
