import { getPrisma } from "@/lib/prisma";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Search, Mail } from "lucide-react";
import Link from "next/link";
import { RoleToggle } from "../components/RoleToggle";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage(
    props: { searchParams: Promise<{ page?: string; search?: string }> }
) {
    const prisma = getPrisma();
    if (!prisma) return <div className="p-8 text-rose-400">Database connection failed.</div>;

    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams.page) || 1;
    const perPage = 20;
    const search = searchParams.search || "";

    const whereClause = search
        ? {
              OR: [
                  { name: { contains: search, mode: "insensitive" as const } },
                  { email: { contains: search, mode: "insensitive" as const } },
              ],
          }
        : {};

    const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
            where: whereClause,
            skip: (currentPage - 1) * perPage,
            take: perPage,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
                _count: {
                    select: {
                        progress: true,
                        pronunciationAttempts: true,
                    },
                },
            },
        }),
        prisma.user.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / perPage);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">User Management</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        {totalCount} registered user{totalCount !== 1 ? 's' : ''}
                    </p>
                </div>
                <form action="/admin/users" method="GET" className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search users..."
                            defaultValue={search}
                            className="w-full bg-white/5 border border-white/5 rounded-full pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* User Table */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-white/[0.02] border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-medium">User Profile</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium text-right">Lessons</th>
                                <th className="px-6 py-4 font-medium text-right">Voice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {u.image ? (
                                                    <Image
                                                        src={u.image}
                                                        alt={u.name || "User"}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full border border-white/10"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 font-bold">
                                                        {u.name?.[0] || u.email[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                                                        {u.name || "Unknown"}
                                                    </div>
                                                    <div className="text-slate-500 flex items-center gap-1.5 mt-0.5 text-xs">
                                                        <Mail className="w-3 h-3" />
                                                        {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <RoleToggle userId={u.id} currentRole={u.role} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-300">{formatDistanceToNow(u.createdAt, { addSuffix: true })}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-slate-300 font-medium">{u._count.progress}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-slate-300 font-medium">{u._count.pronunciationAttempts}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                            Showing <span className="text-white font-medium">{(currentPage - 1) * perPage + 1}</span> to{" "}
                            <span className="text-white font-medium">{Math.min(currentPage * perPage, totalCount)}</span> of{" "}
                            <span className="text-white font-medium">{totalCount}</span> users
                        </span>
                        <div className="flex items-center gap-2">
                            {currentPage > 1 && (
                                <Link
                                    href={`/admin/users?page=${currentPage - 1}${search ? `&search=${search}` : ""}`}
                                    className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5 transition-colors"
                                >
                                    Previous
                                </Link>
                            )}
                            {currentPage < totalPages && (
                                <Link
                                    href={`/admin/users?page=${currentPage + 1}${search ? `&search=${search}` : ""}`}
                                    className="px-3 py-1.5 text-sm font-medium rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
