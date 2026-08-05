import Link from "next/link";

import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

import { logoutAdmin } from "./actions";
import { AdminLiveChatBadge, AdminUnreadProvider } from "./AdminUnreadProvider";

type AdminNavigationItem = {
    label: string;
    href: string;
    ownerOnly?: boolean;
    available?: boolean;
};
const adminNavigation: AdminNavigationItem[] = [
    {
        label: "Overview",
        href: "/admin",
    },
    {
        label: "Accounts",
        href: "/admin/accounts",
        ownerOnly: true,
    },
    {
        label: "Members",
        href: "/admin/members",
    },
    {
        label: "Daily Rewards",
        href: "/admin/daily-rewards",
    },
    {
        label: "Lucky Spin",
        href: "/admin/lucky-spin",
    },
    {
        label: "Live Chat",
        href: "/admin/live-chat",
    },
    {
        label: "Brands",
        href: "/admin/brands",
    },
    {
        label: "Games",
        href: "/admin/games",
    },
    {
        label: "Downloads",
        href: "/admin/downloads",
    },
    {
        label: "Promotions",
        href: "/admin/promotions",
    },
    {
        label: "FAQ",
        href: "/admin/faq",
    },
    {
        label: "Settings",
        href: "/admin/settings",
        ownerOnly: true,
    },
];

export default async function AdminLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    const adminProfile = await requireAdmin();
    const client = createAdminClient();
    const [conversationReadResult, memberMessagesResult] = await Promise.all([
        client.from("chat_conversations").select("id, admin_last_read_at").order("last_message_at", { ascending: false }).limit(250),
        client.from("chat_messages").select("id, conversation_id, created_at").eq("sender_type", "member").order("created_at", { ascending: false }).limit(5000),
    ]);
    const visibleNavigation = adminNavigation.filter(
        (item) =>
            !item.ownerOnly || adminProfile.role === "owner",
    );

    return (
        <AdminUnreadProvider
            initialConversations={conversationReadResult.data ?? []}
            initialMemberMessages={memberMessagesResult.data ?? []}
        >
        <div className="min-h-screen bg-zinc-950 text-white">
            <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-white/10 bg-black/80 p-5 backdrop-blur-2xl lg:block">
                <Link
                    href="/admin"
                    className="flex items-center gap-3"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-lg font-black text-yellow-300">
                        7
                    </div>

                    <div>
                        <p className="font-black tracking-wide">
                            7ERA Admin
                        </p>

                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                            CMS Platform
                        </p>
                    </div>
                </Link>

                <nav
                    className="mt-10 flex max-h-[calc(100vh-220px)] flex-col gap-2 overflow-y-auto pb-24 pr-1"
                    aria-label="Admin navigation"
                >
                    {visibleNavigation
                        .map((item) =>
                            item.available !== false ? (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={false}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-zinc-400 transition hover:border-yellow-400/20 hover:bg-yellow-400/10 hover:text-yellow-300"
                                >
                                    <span>{item.label}</span>
                                    {item.href === "/admin/live-chat" && <AdminLiveChatBadge />}
                                </Link>
                            ) : (
                                <div
                                    key={item.href}
                                    className="flex cursor-not-allowed items-center justify-between rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold text-zinc-600"
                                    aria-disabled="true"
                                >
                                    <span>{item.label}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                                        Coming soon
                                    </span>
                                </div>
                            ),
                        )}
                </nav>

                <div className="absolute bottom-5 left-5 right-5 space-y-3">
                    <Link
                        href="/"
                        className="block rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-zinc-400 transition hover:border-yellow-400/20 hover:text-yellow-300"
                    >
                        View Website
                    </Link>

                    <form action={logoutAdmin}>
                        <button
                            type="submit"
                            className="w-full rounded-2xl border border-red-400/20 px-4 py-3 text-center text-sm font-semibold text-zinc-400 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            <div className="lg:pl-60">
                <header className="sticky top-0 z-40 flex min-h-20 items-center justify-between gap-4 border-b border-white/10 bg-black/75 px-6 backdrop-blur-2xl">
                    <div>
                        <p className="text-sm font-bold text-white">
                            Content Management System
                        </p>

                        <p className="hidden text-xs text-zinc-500 sm:block">
                            Manage the 7ERA Platform website
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-bold text-white">
                                {adminProfile.fullName}
                            </p>

                            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-yellow-300">
                                {adminProfile.role}
                            </p>
                        </div>

                        <form action={logoutAdmin}>
                            <button
                                type="submit"
                                className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>
                </header>

                <nav
                    className="sticky top-20 z-30 flex gap-2 overflow-x-auto border-b border-white/10 bg-black/90 px-6 py-3 backdrop-blur-2xl lg:hidden"
                    aria-label="Mobile admin navigation"
                >
                    {visibleNavigation
                        .filter((item) => item.available !== false)
                        .map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={false}
                                className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-zinc-300 transition hover:border-yellow-400/30 hover:text-yellow-300"
                            >
                                <span>{item.label}</span>
                                {item.href === "/admin/live-chat" && <AdminLiveChatBadge />}
                            </Link>
                        ))}
                </nav>

                <main className="px-4 py-8 sm:px-6 lg:px-6">
                    {children}
                </main>
            </div>
        </div>
        </AdminUnreadProvider>
    );
}
