import Link from "next/link";

const adminNavigation = [
  {
    label: "Overview",
    href: "/admin",
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
  },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          {adminNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-zinc-400 transition hover:border-yellow-400/20 hover:bg-yellow-400/10 hover:text-yellow-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-zinc-400 transition hover:border-yellow-400/20 hover:text-yellow-300"
        >
          View Website
        </Link>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 flex min-h-20 items-center justify-between border-b border-white/10 bg-black/75 px-6 backdrop-blur-2xl lg:px-10">
          <div>
            <p className="text-sm font-bold text-white">
              Content Management System
            </p>

            <p className="text-xs text-zinc-500">
              Manage the 7ERA Platform website
            </p>
          </div>

          <div className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-yellow-300">
            Development
          </div>
        </header>

        <main className="px-6 py-10 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}