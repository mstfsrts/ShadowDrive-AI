import { auth } from "@/auth";
import Image from "next/image";
import { Bell, Search } from "lucide-react";

export async function AdminHeader() {
    const session = await auth();

    return (
        <header className="sticky top-0 z-40 h-16 w-full bg-[#0a0f18]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 flex items-center justify-between">
            {/* Left side: Search or Title placeholder */}
            <div className="flex-1 flex items-center gap-4 text-slate-400">
                <div className="relative max-w-sm hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search users or content..."
                        className="w-full bg-white/5 border border-white/5 rounded-full pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    />
                </div>
                {/* Mobile placeholder */}
                <Search className="w-5 h-5 sm:hidden" />
            </div>

            {/* Right side: User actions */}
            <div className="flex items-center gap-4 sm:gap-6">
                <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute 1 top-0 right-0 w-2 h-2 rounded-full bg-rose-500 border border-[#0a0f18]"></span>
                </button>
                
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-medium text-slate-200">{session?.user?.name || "Admin"}</span>
                        <span className="text-xs text-emerald-400 font-medium">Administrator</span>
                    </div>
                    {session?.user?.image ? (
                        <Image
                            src={session.user.image}
                            alt="Admin"
                            width={36}
                            height={36}
                            className="rounded-full border border-white/10"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 font-bold">
                            {session?.user?.name?.[0] || "A"}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

