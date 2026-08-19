import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/admin/access";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin Dashboard | 7ERA Platform",
  description:
    "Content management dashboard for the 7ERA Platform.",
  robots: {
    index: false,
    follow: false,
  },
};

const contentCards = [
  {
    label: "Brands",
    value: "4",
    href: "/admin/brands",
  },
  {
    label: "Games",
    value: "6",
    href: "/admin/games",
  },
  {
    label: "Downloads",
    value: "6",
    href: "/admin/downloads",
  },
  {
    label: "Promotions",
    value: "6",
    href: "/admin/promotions",
  },
  {
    label: "FAQ",
    value: "6",
    href: "/admin/faq",
  },
];

type DashboardCardData = {
  label: string;
  value: string;
  href?: string;
};

type LaunchCheck = {
  label: string;
  detail: string;
  href: string;
  ready: boolean;
};

function isPlaceholder(value: string | null | undefined) {
  return !value || value.trim() === "#";
}

function DashboardCard({
  card,
}: {
  card: DashboardCardData;
}) {
  const content = (
    <>
      <p className="text-sm font-semibold text-zinc-500">
        {card.label}
      </p>

      <p className="mt-4 text-4xl font-black text-yellow-300">
        {card.value}
      </p>

      <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
        {card.href
          ? "Manage content →"
          : "Module coming soon"}
      </p>
    </>
  );

  if (card.href) {
    return (
      <Link
        href={card.href}
        prefetch={false}
        className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-black p-6 transition hover:border-yellow-400/30"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-black p-6">
      {content}
    </div>
  );
}

const managementLinks = [
  {
    title: "Manage Downloads",
    description:
      "Update versions, platform links, file sizes and availability.",
    href: "/admin/downloads",
  },
  {
    title: "Manage Promotions",
    description:
      "Create campaigns, change statuses and update promotion content.",
    href: "/admin/promotions",
  },
  {
    title: "Manage FAQ",
    description:
      "Create, edit, reorder and hide frequently asked questions.",
    href: "/admin/faq",
  },
  {
    title: "Website Settings",
    description:
      "Manage website identity, navigation, contact links and SEO.",
    href: "/admin/settings",
    ownerOnly: true,
  },
];

export default async function AdminPage() {
  const admin = await requireAdmin();
  const adminClient = createAdminClient();
  const malaysiaToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const [
    memberResult,
    activeMemberResult,
    dailyClaimResult,
    spinResult,
    openChatResult,
    brandResult,
    gameResult,
    downloadResult,
    promotionResult,
    faqResult,
    settingsResult,
    brandLinksResult,
    gameLinksResult,
    downloadLinksResult,
  ] = await Promise.all([
    adminClient.from("member_profiles").select("id", {
      count: "exact",
      head: true,
    }),
    adminClient.from("member_profiles").select("id", {
      count: "exact",
      head: true,
    }).eq("status", "active"),
    adminClient.from("daily_reward_claims").select("id", {
      count: "exact",
      head: true,
    }).eq("claim_date", malaysiaToday),
    adminClient.from("spin_results").select("id", {
      count: "exact",
      head: true,
    }).eq("spin_date", malaysiaToday),
    adminClient.from("chat_conversations").select("id", {
      count: "exact",
      head: true,
    }).neq("status", "closed"),
    adminClient.from("brands").select("id", {
      count: "exact",
      head: true,
    }),
    adminClient.from("games").select("id", {
      count: "exact",
      head: true,
    }),
    adminClient.from("downloads").select("id", {
      count: "exact",
      head: true,
    }),
    adminClient.from("promotions").select("id", {
      count: "exact",
      head: true,
    }),
    adminClient.from("faq_items").select("id", {
      count: "exact",
      head: true,
    }),
    adminClient
      .from("website_settings")
      .select("whatsapp_url, heylink_url, site_url")
      .eq("id", 1)
      .maybeSingle(),
    adminClient
      .from("brands")
      .select("whatsapp_url, heylink_url")
      .eq("is_active", true),
    adminClient
      .from("games")
      .select("download_url")
      .eq("is_active", true),
    adminClient
      .from("downloads")
      .select("download_url")
      .eq("is_active", true),
  ]);

  const settings = settingsResult.data;
  const incompleteBrands = (brandLinksResult.data ?? []).filter(
    (brand) =>
      isPlaceholder(brand.whatsapp_url) || isPlaceholder(brand.heylink_url),
  ).length;
  const incompleteGames = (gameLinksResult.data ?? []).filter((game) =>
    isPlaceholder(game.download_url),
  ).length;
  const incompleteDownloads = (downloadLinksResult.data ?? []).filter(
    (download) => isPlaceholder(download.download_url),
  ).length;

  const launchChecks: LaunchCheck[] = [
    {
      label: "WhatsApp support",
      detail: isPlaceholder(settings?.whatsapp_url)
        ? "Official WhatsApp link is still missing."
        : "Official WhatsApp link is ready.",
      href: "/admin/settings",
      ready: !isPlaceholder(settings?.whatsapp_url),
    },
    {
      label: "HeyLink support",
      detail: isPlaceholder(settings?.heylink_url)
        ? "Official HeyLink address is still missing."
        : "Official HeyLink address is ready.",
      href: "/admin/settings",
      ready: !isPlaceholder(settings?.heylink_url),
    },
    {
      label: "Brand contact links",
      detail:
        incompleteBrands > 0
          ? `${incompleteBrands} active brand${incompleteBrands === 1 ? "" : "s"} still need contact links.`
          : "All active brand contact links are ready.",
      href: "/admin/brands",
      ready: incompleteBrands === 0,
    },
    {
      label: "Game access links",
      detail:
        incompleteGames > 0
          ? `${incompleteGames} active game${incompleteGames === 1 ? "" : "s"} still show Coming Soon.`
          : "All active game links are ready.",
      href: "/admin/games",
      ready: incompleteGames === 0,
    },
    {
      label: "Download links",
      detail:
        incompleteDownloads > 0
          ? `${incompleteDownloads} active download${incompleteDownloads === 1 ? "" : "s"} still need a link.`
          : "All active download links are ready.",
      href: "/admin/downloads",
      ready: incompleteDownloads === 0,
    },
    {
      label: "Official website domain",
      detail: !settings?.site_url || settings.site_url.includes("vercel.app")
        ? "The website is still using its temporary Vercel address."
        : "The official website domain is ready.",
      href: "/admin/settings",
      ready: Boolean(
        settings?.site_url && !settings.site_url.includes("vercel.app"),
      ),
    },
  ];

  const readyLaunchChecks = launchChecks.filter((item) => item.ready).length;

  const operationCards = [
    {
      label: "Members",
      value: String(memberResult.count ?? 0),
      detail: `${activeMemberResult.count ?? 0} active`,
      href: "/admin/members",
    },
    {
      label: "Daily Check-ins",
      value: String(dailyClaimResult.count ?? 0),
      detail: "Claimed today",
      href: "/admin/daily-rewards",
    },
    {
      label: "Lucky Spins",
      value: String(spinResult.count ?? 0),
      detail: "Spins today",
      href: "/admin/lucky-spin",
    },
    {
      label: "Live Chat",
      value: String(openChatResult.count ?? 0),
      detail: "Open conversations",
      href: "/admin/live-chat",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">
          Dashboard Overview
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Welcome to 7ERA Admin
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
          Manage live website content, support information and administrator
          access from this secured dashboard.
        </p>
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">
              Member Operations
            </p>
            <h2 className="mt-3 text-2xl font-black">Today at a glance</h2>
          </div>
          <p className="text-xs text-zinc-500">Malaysia time · {malaysiaToday}</p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {operationCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              prefetch={false}
              className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-black p-6 transition hover:border-yellow-400/30"
            >
              <p className="text-sm font-semibold text-zinc-500">{card.label}</p>
              <p className="mt-4 text-4xl font-black text-yellow-300">{card.value}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                {card.detail} →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">
            Website Content
          </p>
          <h2 className="mt-3 text-2xl font-black">Published content</h2>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {contentCards.map((card) => (
            <DashboardCard
              key={card.label}
              card={
                card.label === "Brands"
                  ? { ...card, value: String(brandResult.count ?? 0) }
                  : card.label === "Games"
                    ? { ...card, value: String(gameResult.count ?? 0) }
                    : card.label === "Downloads"
                      ? { ...card, value: String(downloadResult.count ?? 0) }
                      : card.label === "Promotions"
                        ? { ...card, value: String(promotionResult.count ?? 0) }
                        : card.label === "FAQ"
                          ? { ...card, value: String(faqResult.count ?? 0) }
                          : card
              }
            />
          ))}
        </div>
      </section>

      {admin.role === "owner" && (
        <section className="mt-12 rounded-[28px] border border-yellow-400/20 bg-yellow-400/[0.04] p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">
                Launch Readiness
              </p>
              <h2 className="mt-3 text-2xl font-black">
                Official details checklist
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                Complete these public links before inviting customers to use the
                website.
              </p>
            </div>
            <p className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-black text-zinc-300">
              {readyLaunchChecks} / {launchChecks.length} ready
            </p>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-2">
            {launchChecks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                prefetch={false}
                className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/25 p-5 transition hover:border-yellow-400/30"
              >
                <div>
                  <h3 className="font-bold text-white">{item.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {item.detail}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                    item.ready
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-amber-400/10 text-amber-200"
                  }`}
                >
                  {item.ready ? "Ready" : "Pending"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">
            Content Management
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Quick actions
          </h2>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {managementLinks
            .filter((item) => !item.ownerOnly || admin.role === "owner")
            .map((item) => (
            <Link
              key={item.title}
              href={item.href}
              prefetch={false}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 transition hover:border-yellow-400/30"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {item.description}
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Open
                </span>
              </div>
            </Link>
            ))}
        </div>
      </section>

      <div className="mt-12 rounded-[24px] border border-amber-400/20 bg-amber-400/[0.06] p-6">
        <h2 className="font-bold text-amber-200">
          Secure admin dashboard
        </h2>

        <p className="mt-2 text-sm leading-7 text-amber-100/70">
          Authentication and role checks are active. Editors manage content,
          viewers have read-only access and owner-only controls remain protected.
        </p>
      </div>
    </div>
  );
}
