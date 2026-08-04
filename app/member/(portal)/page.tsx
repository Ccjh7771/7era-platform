import Link from "next/link";

import { requireMember } from "@/lib/member/access";
import { malaysiaDateString } from "@/lib/member/time";
import { createClient } from "@/lib/supabase/server";

import { DailyClaimButton } from "./DailyClaimButton";

export default async function MemberDashboardPage() {
  const member = await requireMember();
  const supabase = await createClient();
  const today = malaysiaDateString();

  const [settingsResult, itemsResult, claimsResult, todayClaimResult, campaignResult] = await Promise.all([
    supabase.from("daily_reward_settings").select("title, subtitle, cycle_length, is_enabled").eq("id", 1).single(),
    supabase.from("daily_reward_items").select("id, day_number, label, description, points_amount, reward_type, is_active").order("day_number"),
    supabase.from("daily_reward_claims").select("id", { count: "exact", head: true }).eq("member_id", member.id),
    supabase.from("daily_reward_claims").select("id").eq("member_id", member.id).eq("claim_date", today).maybeSingle(),
    supabase.from("spin_campaigns").select("id, name, is_active, points_per_spin, daily_limit").eq("is_active", true).maybeSingle(),
  ]);

  const settings = settingsResult.data;
  const items = itemsResult.data ?? [];
  const claimCount = claimsResult.count ?? 0;
  const cycleLength = settings?.cycle_length ?? 7;
  const nextDay = (claimCount % cycleLength) + 1;
  const claimedToday = Boolean(todayClaimResult.data);
  const campaign = campaignResult.data;

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">Welcome back</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-black sm:text-4xl">{member.fullName}</h1>
          <p className="mt-2 text-zinc-500">All daily boundaries follow Malaysia time.</p>
        </div>
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-6 py-4">
          <p className="text-xs uppercase tracking-wider text-yellow-200/70">Points balance</p>
          <p className="mt-1 text-3xl font-black text-yellow-300">{member.pointsBalance.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">Daily check-in</p>
              <h2 className="mt-2 text-2xl font-black">{settings?.title ?? "Daily Reward"}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">{settings?.subtitle}</p>
            </div>
            <DailyClaimButton disabled={claimedToday || !settings?.is_enabled} />
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {items.slice(0, cycleLength).map((item) => {
              const isNext = item.day_number === nextDay && !claimedToday;
              const completedInCycle = item.day_number < nextDay || claimedToday && item.day_number === nextDay;
              return (
                <div key={item.id} className={`rounded-2xl border p-4 ${isNext ? "border-yellow-400/50 bg-yellow-400/10" : completedInCycle ? "border-emerald-400/20 bg-emerald-400/5" : "border-white/10 bg-black/20"}`}>
                  <p className="text-xs font-black uppercase tracking-wider text-zinc-500">Day {item.day_number}</p>
                  <p className="mt-2 font-bold text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.points_amount > 0 ? `${item.points_amount} points` : item.reward_type.replaceAll("_", " ")}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-zinc-500">Missing a day does not reset progress. Your next claim continues to Day {nextDay}.</p>
        </article>

        <article className="relative overflow-hidden rounded-[28px] border border-yellow-400/20 bg-gradient-to-br from-yellow-400/15 via-amber-500/5 to-black p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">Lucky Spin</p>
          <h2 className="mt-3 text-2xl font-black">{campaign?.name ?? "Coming soon"}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{campaign ? `${campaign.points_per_spin} points per spin · Up to ${campaign.daily_limit} spins daily.` : "The wheel will open when an administrator activates a campaign."}</p>
          <Link href="/member/lucky-spin" className="mt-7 inline-flex h-12 items-center justify-center rounded-2xl border border-yellow-400/30 bg-yellow-400 px-6 text-sm font-black text-black">Open Lucky Spin</Link>
        </article>
      </div>
    </section>
  );
}
