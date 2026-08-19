import Link from "next/link";

import { getWebsiteSettings } from "@/lib/data/get-website-settings";
import { isActionableHref } from "@/lib/links";

export async function Footer() {
  const settings = await getWebsiteSettings();
  const hasWhatsApp = isActionableHref(settings.whatsappUrl);
  const hasHeyLink = isActionableHref(settings.heylinkUrl);
  const complaintMessage = [
    "Hello 7ERA, I would like to submit a complaint.",
    "Registered mobile number:",
    "Issue:",
  ].join("\n");
  const complaintUrl = hasWhatsApp
    ? `${settings.whatsappUrl}${settings.whatsappUrl.includes("?") ? "&" : "?"}text=${encodeURIComponent(complaintMessage)}`
    : null;

  return (
    <>
      {complaintUrl ? (
        <a
          href={complaintUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open the 7ERA complaint hotline on WhatsApp"
          className="group fixed bottom-5 right-5 z-[80] flex items-center gap-3 rounded-full border border-yellow-300/50 bg-black/90 px-3 py-3 text-left shadow-[0_0_35px_rgba(250,204,21,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-yellow-200 hover:shadow-[0_0_45px_rgba(250,204,21,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:bottom-7 sm:right-7 sm:px-4"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.35)] transition group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.28-1.28a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92Z" />
            </svg>
          </span>

          <span className="pr-1">
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-300">
              Need assistance?
            </span>
            <span className="mt-0.5 block whitespace-nowrap text-sm font-black text-white">
              Complaint Hotline
            </span>
          </span>
        </a>
      ) : null}

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
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
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

          <div>
            <h3 className="text-lg font-bold text-white">
              Legal &amp; Safety
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              <Link href="/privacy" className="text-zinc-400 transition hover:text-yellow-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-zinc-400 transition hover:text-yellow-300">
                Terms &amp; Conditions
              </Link>
              <Link href="/responsible-gaming" className="text-zinc-400 transition hover:text-yellow-300">
                Responsible Gaming
              </Link>
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
    </>
  );
}
