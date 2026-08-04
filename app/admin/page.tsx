import type { Metadata } from "next";
import Link from "next/link";

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
];

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
  },
];

export default function AdminPage() {
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
          <Link
            key={card.label}
            href={card.href}
            className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-black p-6 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/30"
          >
            <p className="text-sm font-semibold text-zinc-500">
              {card.label}
            </p>

            <p className="mt-4 text-4xl font-black text-yellow-300">
              {card.value}
            </p>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
              Manage content →
            </p>
          </Link>
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
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:border-yellow-400/30 hover:bg-yellow-400/[0.06]"
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

                <span
                  className="text-xl text-yellow-300 transition group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12 rounded-[24px] border border-amber-400/20 bg-amber-400/[0.06] p-6">
        <h2 className="font-bold text-amber-200">
          Development-only dashboard
        </h2>

        <p className="mt-2 text-sm leading-7 text-amber-100/70">
          This route is not protected yet. Do not enter private information,
          credentials or production data until authentication and authorization
          are added.
        </p>
      </div>
    </div>
  );
}