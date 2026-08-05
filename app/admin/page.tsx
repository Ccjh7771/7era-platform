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
  ]);

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
