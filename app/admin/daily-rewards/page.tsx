import { ImageUploadField } from "@/app/admin/_components/ImageUploadField";
import { requireAdmin } from "@/lib/admin/access";
import { displayMalaysianPhone } from "@/lib/member/phone";
import { createAdminClient } from "@/lib/supabase/admin";

import { saveDailyRewardItem, updateDailyRewardSettings } from "./actions";
import { RewardClaimsPanel, type DailyRewardClaimRecord } from "./RewardClaimsPanel";

const rewardTypes = ["points", "prize", "welcome_bonus", "double_points", "free_spin", "custom"];

export default async function AdminDailyRewardsPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const client = createAdminClient();
  const [settingsResult, itemsResult, dailyCheckInsResult, claimsResult] = await Promise.all([
    client.from("daily_reward_settings").select("*").eq("id", 1).single(),
    client.from("daily_reward_items").select("*").order("day_number"),
    client.from("daily_reward_claims").select("member_id, points_awarded").order("created_at", { ascending: false }).limit(5000),
    client.from("reward_claims").select("id, reward_name, claim_code, status, created_at, member_profiles(full_name, phone)").eq("source_type", "daily_reward").order("created_at", { ascending: false }).limit(500),
  ]);
  const settings = settingsResult.data;
  const items = itemsResult.data ?? [];
  const editable = admin.role !== "viewer";
  const dailyCheckIns = dailyCheckInsResult.data ?? [];
  const claims = (claimsResult.data ?? []).map((claim) => {
    const profile = Array.isArray(claim.member_profiles) ? claim.member_profiles[0] : claim.member_profiles;
    return {
      id: claim.id,
      memberName: profile?.full_name ?? "Member",
      memberPhone: profile?.phone ? displayMalaysianPhone(profile.phone) : "",
      rewardName: claim.reward_name,
      claimCode: claim.claim_code,
      status: claim.status,
      createdAt: claim.created_at,
    } satisfies DailyRewardClaimRecord;
  });
  const summary = {
    checkIns: dailyCheckIns.length,
    participants: new Set(dailyCheckIns.map((claim) => claim.member_id)).size,
    pointsAwarded: dailyCheckIns.reduce((sum, claim) => sum + claim.points_awarded, 0),
    pendingClaims: claims.filter((claim) => claim.status === "pending").length,
  };

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">Engagement</p>
      <h1 className="mt-3 text-3xl font-black">Daily Rewards</h1>
      <p className="mt-2 text-sm text-zinc-500">Members continue to the next day even when they miss a calendar day. Reset time is 12:00 AM Malaysia time.</p>
      {params.success && <p className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">Daily Reward settings updated.</p>}
      {params.error && <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{params.error === "image_too_large" ? "This reward image is larger than 3MB. Choose a smaller image." : params.error === "invalid_image" ? "Choose a genuine PNG, JPG or WebP reward image." : params.error === "upload_failed" ? "The reward image could not be uploaded. Please try again." : "Unable to save the requested change."}</p>}
      <form action={updateDailyRewardSettings} className="mt-8 grid gap-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-2">
        <div><label className="text-sm font-semibold">Title</label><input name="title" required defaultValue={settings?.title} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4" /></div>
        <div><label className="text-sm font-semibold">Cycle length</label><input name="cycleLength" type="number" min={1} max={31} required defaultValue={settings?.cycle_length ?? 7} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4" /></div>
        <div className="sm:col-span-2"><label className="text-sm font-semibold">Subtitle</label><input name="subtitle" maxLength={300} defaultValue={settings?.subtitle} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4" /></div>
        <label className="flex items-center gap-3 text-sm"><input name="isEnabled" type="checkbox" defaultChecked={settings?.is_enabled} /> Enable Daily Reward</label>
        {editable && <button className="h-12 rounded-xl bg-yellow-400 font-black text-black sm:justify-self-end sm:px-8">Save settings</button>}
      </form>

      <div className="mt-10 space-y-5">
        {items.map((item) => <form key={item.id} action={saveDailyRewardItem} className="grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-5 lg:grid-cols-4"><input type="hidden" name="itemId" value={item.id} /><div><label className="text-xs text-zinc-500">Day</label><input name="dayNumber" type="number" min={1} max={31} defaultValue={item.day_number} required className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3" /></div><div><label className="text-xs text-zinc-500">Reward type</label><select name="rewardType" defaultValue={item.reward_type} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3">{rewardTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></div><div><label className="text-xs text-zinc-500">Points</label><input name="pointsAmount" type="number" min={0} defaultValue={item.points_amount} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3" /></div><div><label className="text-xs text-zinc-500">Inventory (blank = unlimited)</label><input name="inventory" type="number" min={0} defaultValue={item.inventory_total ?? ""} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3" /></div><div className="lg:col-span-2"><label className="text-xs text-zinc-500">Label</label><input name="label" required defaultValue={item.label} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3" /></div><div className="lg:col-span-2"><label className="text-xs text-zinc-500">Description</label><input name="description" defaultValue={item.description} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3" /></div><div className="lg:col-span-3"><ImageUploadField id={`daily-${item.id}`} label="Reward image" currentUrl={item.image_path} /></div><div className="flex items-end justify-between gap-3"><label className="mb-3 flex items-center gap-2 text-sm"><input name="isActive" type="checkbox" defaultChecked={item.is_active} /> Active</label>{editable && <button className="h-11 rounded-xl bg-yellow-400 px-5 text-sm font-black text-black">Save Day {item.day_number}</button>}</div></form>)}
      </div>

      <RewardClaimsPanel claims={claims} summary={summary} editable={editable} />
    </section>
  );
}
