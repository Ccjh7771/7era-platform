import type { Metadata } from "next";
import Link from "next/link";

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

const dashboardCards = [
  {
    label: "Brands",
    value: "4",
    href: "/admin/brands",
  },
  {
    label: "Games",
    value: "6",
  },
  {
    label: "Downloads",
    value: "6",
  },
  {
    label: "Promotions",
    value: "6",
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
  },
  {
    title: "Manage Promotions",
    description:
      "Create campaigns, change statuses and update promotion content.",
  },
  {
    title: "Manage FAQ",
    description:
      "Create, edit, reorder and hide frequently asked questions.",
  },
  {
    title: "Website Settings",
    description:
      "Manage website identity, navigation, contact links and SEO.",
  },
];

export default async function AdminPage() {
  const adminClient = createAdminClient();

  const { count: brandCount } = await adminClient
    .from("brands")
    .select("id", {
      count: "exact",
      head: true,
    });

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
          This is the CMS foundation for managing website content. The current
          dashboard uses static sample data and will later connect to the
          database and secured admin accounts.
        </p>
      </div>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <DashboardCard
            key={card.label}
            card={
              card.label === "Brands"
                ? {
                    ...card,
                    value: String(brandCount ?? 0),
                  }
                : card
            }
          />
        ))}
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
          {managementLinks.map((item) => (
            <div
              key={item.title}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6"
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
                  Coming soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 rounded-[24px] border border-amber-400/20 bg-amber-400/[0.06] p-6">
        <h2 className="font-bold text-amber-200">
          Secure admin dashboard
        </h2>

        <p className="mt-2 text-sm leading-7 text-amber-100/70">
          Authentication and role checks are active. Content modules will be
          enabled one at a time as their database workflows are completed and
          tested.
        </p>
      </div>
    </div>
  );
}
