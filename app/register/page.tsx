import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 text-white">
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[-240px] right-[-160px] h-[480px] w-[480px] rounded-full bg-purple-500/10 blur-[160px]" />

      <section className="relative z-10 w-full max-w-2xl rounded-[36px] border border-yellow-400/20 bg-gradient-to-b from-white/[0.07] via-zinc-950/95 to-black p-8 text-center shadow-[0_35px_100px_rgba(0,0,0,0.7)] sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-yellow-400/30 bg-yellow-400/10 text-3xl font-black text-yellow-300 shadow-[0_0_45px_rgba(250,204,21,0.15)]">
          7
        </div>

        <p className="mt-8 text-xs font-black uppercase tracking-[0.4em] text-yellow-300">
          Member Registration
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">
          Coming Soon
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-8 text-zinc-400 sm:text-lg">
          New member registration is not available yet. We are preparing the
          7ERA member experience and will open registration soon.
        </p>

        <div className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-full border border-yellow-400/15 bg-yellow-400/[0.06] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-yellow-200">
          <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-300" />
          Preparing for launch
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <Link
            href="/"
            className="flex min-h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 px-6 font-black text-black transition hover:-translate-y-1"
          >
            Back to Website
          </Link>
          <Link
            href="/#contact"
            className="flex min-h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 font-bold text-white transition hover:-translate-y-1 hover:border-yellow-400/30 hover:text-yellow-300"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </main>
  );
}
