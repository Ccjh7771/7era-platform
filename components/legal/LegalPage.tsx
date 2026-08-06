import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export function LegalPage({ eyebrow, title, intro, children }: LegalPageProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black px-6 py-20 text-white sm:py-28">
        <article className="mx-auto max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">{intro}</p>
          <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm leading-6 text-yellow-100">
            Draft for operational use. The platform owner should have this page reviewed by qualified Malaysian counsel before a full public launch.
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">Last updated: 6 August 2026</p>
          <div className="mt-12 space-y-10 text-sm leading-7 text-zinc-300 [&_a]:font-bold [&_a]:text-yellow-300 [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-white [&_li]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
