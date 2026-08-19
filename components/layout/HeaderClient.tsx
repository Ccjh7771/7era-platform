"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeaderClientProps = {
  siteName: string;
  shortName: string;
  brandLabel: string;
  logoPath: string | null;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
};

const navigationItems = [
  { title: "Home", href: "/" },
  { title: "Brands", href: "/#brands" },
  { title: "Games", href: "/#games" },
  { title: "Downloads", href: "/download" },
  { title: "Promotions", href: "/promotions" },
  { title: "Members", href: "/member/login" },
];

export function HeaderClient({
  siteName,
  shortName,
  brandLabel,
  logoPath,
  primaryCtaLabel,
  primaryCtaUrl,
}: HeaderClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || mobileMenuOpen
          ? "border-b border-white/10 bg-black/80 shadow-2xl backdrop-blur-2xl"
          : "bg-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-500 ${
          scrolled ? "h-[72px]" : "h-24"
        }`}
      >
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="group flex items-center gap-3"
          aria-label={`${siteName} home`}
        >
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-yellow-400/20 bg-yellow-400/10 shadow-[0_0_25px_rgba(250,204,21,0.18)] transition-all duration-300 group-hover:scale-105 group-hover:border-yellow-300/40">
            {logoPath ? (
              <Image
                src={logoPath}
                alt={`${siteName} logo`}
                fill
                sizes="44px"
                className="object-contain p-1"
              />
            ) : (
              <span className="text-lg font-black text-yellow-300">7</span>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wide text-white">
              {shortName}
            </span>
            <span className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">
              {brandLabel}
            </span>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex lg:gap-9"
          aria-label="Main navigation"
        >
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative text-sm font-medium tracking-wide text-zinc-300 transition duration-300 hover:text-yellow-300"
            >
              {item.title}
              <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-yellow-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="hidden rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:border-yellow-400/40 hover:text-yellow-300 sm:inline-flex"
          >
            Register
          </Link>
          <Link
            href={primaryCtaUrl}
            className="hidden rounded-full border border-yellow-400/30 bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 px-6 py-3 text-sm font-bold text-black shadow-[0_0_30px_rgba(250,204,21,0.25)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_45px_rgba(250,204,21,0.45)] lg:inline-flex"
          >
            {primaryCtaLabel}
          </Link>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((currentState) => !currentState);
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-all duration-300 hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 md:hidden"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span className="relative h-5 w-5">
              <span
                className={`absolute left-0 top-[3px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  mobileMenuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[9px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  mobileMenuOpen ? "scale-x-0 opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[15px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  mobileMenuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t transition-all duration-500 md:hidden ${
          mobileMenuOpen
            ? "max-h-[600px] border-white/10 opacity-100"
            : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-5">
          <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={closeMobileMenu}
                className="flex min-h-14 items-center justify-between rounded-2xl border border-transparent px-5 text-base font-semibold text-zinc-300 transition-all duration-300 hover:border-yellow-400/20 hover:bg-yellow-400/10 hover:text-yellow-300"
              >
                <span>{item.title}</span>
                <span className="text-yellow-400" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </nav>

          <Link
            href="/register"
            onClick={closeMobileMenu}
            className="mt-4 inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-white/15 px-6 text-sm font-black text-white"
          >
            Register member
          </Link>

          <Link
            href={primaryCtaUrl}
            onClick={closeMobileMenu}
            className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-yellow-400/30 bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 px-6 py-3 text-sm font-black text-black shadow-[0_0_30px_rgba(250,204,21,0.25)] transition-all duration-300 hover:shadow-[0_0_45px_rgba(250,204,21,0.45)]"
          >
            {primaryCtaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
