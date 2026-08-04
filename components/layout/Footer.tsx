import Link from "next/link";

import { getWebsiteSettings } from "@/lib/data/get-website-settings";
import { isActionableHref } from "@/lib/links";

export async function Footer() {
  const settings = await getWebsiteSettings();
  const hasWhatsApp = isActionableHref(settings.whatsappUrl);
  const hasHeyLink = isActionableHref(settings.heylinkUrl);

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-zinc-950 via-black to-black">
      {/* Background Glow */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0

          before:absolute
          before:left-[-150px]
          before:top-[-80px]
          before:h-[320px]
          before:w-[320px]
          before:rounded-full
          before:bg-violet-500/10
          before:blur-[120px]

          after:absolute
          after:right-[-120px]
          after:bottom-[-120px]
          after:h-[360px]
          after:w-[360px]
          after:rounded-full
          after:bg-yellow-400/10
          after:blur-[130px]
        "
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h2 className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-300 bg-clip-text text-3xl font-black text-transparent">
              {settings.shortName}
            </h2>

            <p className="mt-4 max-w-sm leading-7 text-zinc-400">
              {settings.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white">
              Quick Links
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/"
                className="text-zinc-400 transition hover:text-yellow-300"
              >
                Home
              </Link>

              <Link
                href="/#brands"
                className="text-zinc-400 transition hover:text-yellow-300"
              >
                Brands
              </Link>

              <Link
                href="/#games"
                className="text-zinc-400 transition hover:text-yellow-300"
              >
                Games
              </Link>

              <Link
                href="/download"
                className="text-zinc-400 transition hover:text-yellow-300"
              >
                Downloads
              </Link>

              <Link
                href="/promotions"
                className="text-zinc-400 transition hover:text-yellow-300"
              >
                Promotions
              </Link>

              <Link
                href="/faq"
                className="text-zinc-400 transition hover:text-yellow-300"
              >
                FAQ
              </Link>

              <Link
                href="/#contact"
                className="text-zinc-400 transition hover:text-yellow-300"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-white">
              Support
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              {hasWhatsApp ? (
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 transition hover:text-yellow-300"
                >
                  WhatsApp
                </a>
              ) : (
                <span className="text-zinc-600" aria-disabled="true">
                  WhatsApp — Coming Soon
                </span>
              )}

              {hasHeyLink ? (
                <a
                  href={settings.heylinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 transition hover:text-yellow-300"
                >
                  HeyLink
                </a>
              ) : (
                <span className="text-zinc-600" aria-disabled="true">
                  HeyLink — Coming Soon
                </span>
              )}

              <a
                href={`mailto:${settings.supportEmail}`}
                className="text-zinc-400 transition hover:text-yellow-300"
              >
                Email
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-zinc-500">
            {settings.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
