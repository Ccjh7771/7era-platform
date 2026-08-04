import Link from "next/link";
import { redirect } from "next/navigation";

import type { ReactNode } from "react";

import { createClient } from "@/lib/supabase/server";

import { logoutAdmin } from "./actions";

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
        available: false,
    },
    {
        label: "Settings",
        href: "/admin/settings",
        ownerOnly: true,
        available: false,
    },
];

export default async function AdminLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    const supabase = await createClient();

    const {
        data: claimsData,
        error: claimsError,
    } = await supabase.auth.getClaims();

    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
        redirect("/auth/login");
    }

    const {
        data: adminProfile,
        error: profileError,
    } = await supabase
        .from("admin_profiles")
        .select(
            "full_name, role, is_active, must_change_password",
        )
        .eq("id", userId)
        .single();

    if (
        profileError ||
        !adminProfile ||
        !adminProfile.is_active
    ) {
        redirect(
            "/auth/login?error=unauthorized",
        );
    }

    if (adminProfile.must_change_password) {
        redirect(
            "/auth/update-password?required=1",
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-black/80 p-6 backdrop-blur-2xl lg:block">
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
                    className="mt-10 flex flex-col gap-2"
                    aria-label="Admin navigation"
                >
                    {adminNavigation
                        .filter(
                            (item) =>
                                !item.ownerOnly ||
                                adminProfile.role === "owner",
                        )
                        .map((item) =>
                            item.available !== false ? (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={false}
                                    className="rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-zinc-400 transition hover:border-yellow-400/20 hover:bg-yellow-400/10 hover:text-yellow-300"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <div
                                    key={item.href}
                                    className="flex cursor-not-allowed items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-zinc-600"
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

                <div className="absolute bottom-6 left-6 right-6 space-y-3">
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

            <div className="lg:pl-72">
                <header className="sticky top-0 z-40 flex min-h-20 items-center justify-between gap-4 border-b border-white/10 bg-black/75 px-6 backdrop-blur-2xl lg:px-10">
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
                                {adminProfile.full_name}
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

                <main className="px-6 py-10 lg:px-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
