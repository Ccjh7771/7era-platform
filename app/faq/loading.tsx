const faqPlaceholders = Array.from({
  length: 6,
});

export default function FAQLoading() {
  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-36 text-white lg:pb-32 lg:pt-44">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="h-9 w-40 animate-pulse rounded-full bg-white/10" />

          <div className="mt-6 h-12 w-full max-w-2xl animate-pulse rounded-2xl bg-white/10" />

          <div className="mt-5 h-6 w-full max-w-2xl animate-pulse rounded-xl bg-white/[0.06]" />

          <div className="mt-3 h-6 w-4/5 max-w-xl animate-pulse rounded-xl bg-white/[0.06]" />
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <div className="h-[58px] w-full animate-pulse rounded-2xl bg-white/[0.07]" />

          <div className="mt-6 flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-11 w-24 shrink-0 animate-pulse rounded-xl bg-white/[0.07]"
              />
            ))}
          </div>

          <div className="mt-12 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="flex flex-col gap-4">
              {faqPlaceholders.map((_, index) => (
                <div
                  key={index}
                  className="h-16 w-full animate-pulse rounded-2xl bg-white/[0.06]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}