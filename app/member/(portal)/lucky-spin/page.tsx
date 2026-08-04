import Image from "next/image";

import { requireMember } from "@/lib/member/access";
import { malaysiaDateString } from "@/lib/member/time";
import { createClient } from "@/lib/supabase/server";

import { LuckyWheel } from "./LuckyWheel";

export default async function LuckySpinPage() {
  const member = await requireMember();
  const supabase = await createClient();
  const today = malaysiaDateString();
  const { data: campaign } = await supabase.from("spin_campaigns").select("id, name, points_per_spin, daily_limit, starts_at, ends_at, is_active, primary_color, secondary_color, background_color, logo_path, background_image_path").eq("is_active", true).maybeSingle();

  if (!campaign) {
    return <section className="mx-auto max-w-2xl py-20 text-center"><p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">Lucky Spin</p><h1 className="mt-4 text-4xl font-black">The wheel is currently closed</h1><p className="mt-4 text-zinc-500">Please return when the next campaign begins.</p></section>;
  }

  const [prizesResult, spinsResult] = await Promise.all([
    supabase.from("spin_prizes").select("id, name, is_thank_you, position").eq("campaign_id", campaign.id).eq("is_active", true).order("position"),
    supabase.from("spin_results").select("id", { count: "exact", head: true }).eq("member_id", member.id).eq("campaign_id", campaign.id).eq("spin_date", today),
  ]);
  const prizes = (prizesResult.data ?? []).map((prize) => ({ id: prize.id, name: prize.name, isThankYou: prize.is_thank_you }));
  const spinsToday = spinsResult.count ?? 0;
  const canSpin = member.pointsBalance >= campaign.points_per_spin && spinsToday < campaign.daily_limit;

  return (
    <section>
      <div className="mb-10 text-center">
        {campaign.logo_path && <Image src={campaign.logo_path} alt={`${campaign.name} logo`} width={360} height={110} className="mx-auto h-auto w-full max-w-sm" priority />}
        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">7ERA Member Rewards</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">{campaign.name}</h1>
        <p className="mt-4 text-zinc-400">{campaign.points_per_spin} points per spin · {campaign.daily_limit - spinsToday} of {campaign.daily_limit} spins remaining today</p>
      </div>
      <div className="rounded-[32px] border border-yellow-400/15 bg-black/70 bg-cover bg-center bg-blend-overlay p-5 shadow-2xl sm:p-8" style={campaign.background_image_path ? { backgroundImage: `url("${campaign.background_image_path}")` } : undefined}>
        <LuckyWheel prizes={prizes} canSpin={canSpin} />
      </div>
      {!canSpin && <p className="mt-5 text-center text-sm text-amber-200">You need enough points and an available daily spin to continue.</p>}
    </section>
  );
}
