const cardPlaceholders = Array.from({
  length: 6,
});

export default function DownloadLoading() {
  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-36 text-white lg:pb-32 lg:pt-44">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="h-9 w-44 animate-pulse rounded-full bg-white/10" />

          <div className="mt-6 h-12 w-full max-w-md animate-pulse rounded-2xl bg-white/10" />

          <div className="mt-5 h-6 w-full max-w-2xl animate-pulse rounded-xl bg-white/[0.06]" />

          <div className="mt-3 h-6 w-3/4 max-w-xl animate-pulse rounded-xl bg-white/[0.06]" />
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {cardPlaceholders.map((_, index) => (
            <div
              key={index}
              className="flex min-h-[560px] flex-col items-center rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.07] via-zinc-900/90 to-black p-6"
            >
              <div className="h-28 w-28 animate-pulse rounded-3xl bg-white/10" />

              <div className="mt-7 h-8 w-36 animate-pulse rounded-xl bg-white/10" />

              <div className="mt-4 h-5 w-full animate-pulse rounded-lg bg-white/[0.07]" />

              <div className="mt-2 h-5 w-4/5 animate-pulse rounded-lg bg-white/[0.07]" />

              <div className="mt-6 flex gap-2">
                <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />

                <div className="h-8 w-20 animate-pulse rounded-full bg-yellow-400/10" />
              </div>

              <div className="mt-7 h-32 w-full animate-pulse rounded-2xl bg-white/[0.06]" />

              <div className="mt-auto h-13 w-full animate-pulse rounded-2xl bg-yellow-400/20" />

              <div className="mt-3 h-12 w-full animate-pulse rounded-2xl bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}