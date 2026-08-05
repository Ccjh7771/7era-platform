"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { spinLuckyWheel, type SpinState } from "./actions";

const initialSpinState: SpinState = { status: "idle", message: "" };

type WheelPrize = { id: string; name: string; imagePath: string | null; isThankYou: boolean };

const palette = ["#facc15", "#f59e0b", "#111827", "#d97706", "#27272a", "#eab308"];

export function LuckyWheel({ prizes, canSpin }: { prizes: WheelPrize[]; canSpin: boolean }) {
  const [state, action, pending] = useActionState(spinLuckyWheel, initialSpinState);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const router = useRouter();

  const gradient = useMemo(() => {
    const slice = 360 / Math.max(prizes.length, 1);
    return `conic-gradient(${prizes.map((_, index) => `${palette[index % palette.length]} ${index * slice}deg ${(index + 1) * slice}deg`).join(",")})`;
  }, [prizes]);

  useEffect(() => {
    if (state.status !== "success" || !state.prizeId || prizes.length === 0) return;
    const index = prizes.findIndex((prize) => prize.id === state.prizeId);
    const slice = 360 / prizes.length;
    const target = 360 - (Math.max(index, 0) * slice + slice / 2);
    const startTimer = window.setTimeout(() => {
      setShowResult(false);
      setRotation((current) => current + 1800 + target - (current % 360));
    }, 0);
    const resultTimer = window.setTimeout(() => {
      setShowResult(true);
      router.refresh();
    }, 4200);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(resultTimer);
    };
  }, [prizes, router, state.prizeId, state.resultId, state.status]);

  const disabled = !canSpin || prizes.length < 2 || pending;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,.9fr)]">
      <div className="relative mx-auto aspect-square w-full max-w-[560px]">
        <div className="absolute left-1/2 top-[-14px] z-20 h-0 w-0 -translate-x-1/2 border-x-[18px] border-t-[34px] border-x-transparent border-t-white drop-shadow-[0_0_12px_rgba(250,204,21,.8)]" />
        <div className="absolute inset-0 rounded-full border-[10px] border-yellow-300 bg-black p-3 shadow-[0_0_70px_rgba(250,204,21,.25)]">
          <div className="relative h-full w-full rounded-full transition-transform duration-[4000ms] ease-[cubic-bezier(.12,.7,.12,1)]" style={{ background: gradient, transform: `rotate(${rotation}deg)` }}>
            {prizes.map((prize, index) => {
              const angle = (360 / prizes.length) * index + 360 / prizes.length / 2;
              return <span key={prize.id} className="absolute left-1/2 top-1/2 origin-left text-xs font-black text-white drop-shadow-md sm:text-sm" style={{ width: "43%", transform: `rotate(${angle - 90}deg) translateX(10%)`, textAlign: "right" }}>{index + 1}</span>;
            })}
          </div>
          <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-yellow-200 bg-black text-2xl font-black text-yellow-300 shadow-xl">7</div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black">Wheel rewards</h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {prizes.map((prize, index) => (
            <div key={prize.id} className="flex min-h-20 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-yellow-300/20 bg-black">
                {prize.imagePath ? (
                  <Image src={prize.imagePath} alt={prize.name} fill sizes="56px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-center text-[10px] font-black text-yellow-300">TQ</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-black" style={{ background: palette[index % palette.length] }}>{index + 1}</span>
                <p className="font-bold leading-5 text-white">{prize.name}</p>
              </div>
            </div>
          ))}
        </div>
        <form action={action} className="mt-7">
          <button disabled={disabled} className="h-14 w-full rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 text-base font-black text-black shadow-[0_0_35px_rgba(250,204,21,.22)] disabled:cursor-not-allowed disabled:bg-none disabled:bg-zinc-700 disabled:text-zinc-400">
            {pending ? "Spinning…" : "Spin now"}
          </button>
        </form>
        {state.status === "error" && <p role="alert" className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{state.message}</p>}
        {state.status === "success" && showResult && <div className={`mt-4 rounded-2xl border p-5 ${state.isWinner ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10 bg-white/[0.04]"}`}><p className="text-lg font-black">{state.message}</p>{state.claimCode && <p className="mt-2 font-mono text-sm text-emerald-300">Claim code: {state.claimCode}</p>}<p className="mt-2 text-xs text-zinc-500">{state.spinsRemaining} spin(s) remaining today · Balance {state.balance} points</p></div>}
      </div>
    </div>
  );
}
