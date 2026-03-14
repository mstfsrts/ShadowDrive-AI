import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import type { Metadata } from 'next';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';

export const metadata: Metadata = {
    title: 'Admin Dashboard | ShadowDrive AI',
    description: 'Administration panel for ShadowDrive AI.',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    // Enforce RBAC: Only ADMINs can access the /admin route group
    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div className="flex h-screen bg-[#05080f] text-slate-200 overflow-hidden font-sans antialiased selection:bg-emerald-500/30">
            {/* Fixed Sidebar */}
            <AdminSidebar />
            
            {/* Main Content wrapper */}
            <div className="flex-1 flex flex-col lg:pl-64 h-full relative z-0">
                <AdminHeader />
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto min-h-full pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
