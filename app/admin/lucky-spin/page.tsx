import { ImageUploadField } from "@/app/admin/_components/ImageUploadField";
import { requireAdmin } from "@/lib/admin/access";
import { displayMalaysianPhone } from "@/lib/member/phone";
import { formatMalaysiaDateTime } from "@/lib/member/time";
import { createAdminClient } from "@/lib/supabase/admin";

import { saveSpinPrize, setSpinPrizeStatus, updateSpinCampaign, uploadSpinLogo } from "./actions";

function malaysiaLocalInput(value: string | null) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(value));
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
}

export default async function AdminLuckySpinPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const client = createAdminClient();
  const { data: campaign } = await client.from("spin_campaigns").select("*").order("created_at").limit(1).single();
  const [prizesResult, resultsResult] = await Promise.all([
    campaign ? client.from("spin_prizes").select("*").eq("campaign_id", campaign.id).order("position") : Promise.resolve({ data: [] }),
    client.from("spin_results").select("id, is_winner, points_spent, created_at, member_profiles(full_name, phone), spin_prizes(name), reward_claims(claim_code, status)").order("created_at", { ascending: false }).limit(100),
  ]);
  const prizes = prizesResult.data ?? [];
  const totalWeight = prizes.filter((prize) => prize.is_active).reduce((sum, prize) => sum + Number(prize.weight), 0);
  const editable = admin.role !== "viewer";

  if (!campaign) return <p>Lucky Spin campaign could not be loaded.</p>;

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">Member engagement</p>
      <h1 className="mt-3 text-3xl font-black">Lucky Spin</h1>
      <p className="mt-2 text-sm text-zinc-500">Up to 12 prizes plus one required Thank You segment. All daily limits follow Malaysia time.</p>
      {params.success && <p className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">Lucky Spin updated successfully.</p>}
      {params.error && <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{params.error === "prizes_required" ? "Add at least one prize and one Thank You segment before activating the campaign." : "Unable to save the requested change."}</p>}

      <form action={updateSpinCampaign} className="mt-8 grid gap-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 lg:grid-cols-3">
        <input type="hidden" name="campaignId" value={campaign.id} />
        <div><label className="text-sm font-semibold">Campaign name</label><input name="name" defaultValue={campaign.name} required className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4" /></div>
        <div><label className="text-sm font-semibold">Points per spin</label><input name="pointsPerSpin" type="number" min={1} defaultValue={campaign.points_per_spin} required className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4" /></div>
        <div><label className="text-sm font-semibold">Daily limit</label><input name="dailyLimit" type="number" min={1} max={3} defaultValue={campaign.daily_limit} required className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4" /></div>
        <div><label className="text-sm font-semibold">Starts (Malaysia time)</label><input name="startsAt" type="datetime-local" defaultValue={malaysiaLocalInput(campaign.starts_at)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4" /></div>
        <div><label className="text-sm font-semibold">Ends (Malaysia time)</label><input name="endsAt" type="datetime-local" defaultValue={malaysiaLocalInput(campaign.ends_at)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4" /></div>
        <label className="flex items-center gap-3 self-end pb-3 text-sm"><input name="isActive" type="checkbox" defaultChecked={campaign.is_active} /> Campaign active</label>
        <div className="lg:col-span-2"><ImageUploadField id="spin-background" label="Wheel background artwork" currentUrl={campaign.background_image_path} /></div>
        {editable && <button className="h-12 self-end rounded-xl bg-yellow-400 font-black text-black">Save campaign</button>}
      </form>
      <form action={uploadSpinLogo} className="mt-5 grid gap-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-5 lg:grid-cols-[1fr_auto]"><input type="hidden" name="campaignId" value={campaign.id} /><ImageUploadField id="spin-logo" label="Lucky Spin logo" currentUrl={campaign.logo_path} />{editable && <button className="h-12 self-end rounded-xl border border-yellow-400/30 px-6 font-bold text-yellow-300">Upload logo</button>}</form>

      <div className="mt-10 flex items-end justify-between gap-4"><div><h2 className="text-2xl font-black">Wheel segments</h2><p className="mt-1 text-sm text-zinc-500">Active weights are converted automatically into probabilities.</p></div><span className="text-sm text-zinc-500">{prizes.filter((item) => !item.is_thank_you).length}/12 prizes</span></div>
      <div className="mt-5 space-y-5">
        {prizes.map((prize) => <form key={prize.id} action={saveSpinPrize} className="grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-5 lg:grid-cols-5"><input type="hidden" name="prizeId" value={prize.id} /><input type="hidden" name="campaignId" value={campaign.id} /><div className="lg:col-span-2"><label className="text-xs text-zinc-500">Name</label><input name="name" defaultValue={prize.name} required className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3" /></div><div><label className="text-xs text-zinc-500">Weight</label><input name="weight" type="number" step="0.0001" min="0.0001" defaultValue={prize.weight} required className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3" /><p className="mt-1 text-xs text-yellow-300">{totalWeight ? ((Number(prize.weight) / totalWeight) * 100).toFixed(2) : "0"}%</p></div><div><label className="text-xs text-zinc-500">Inventory (blank = unlimited)</label><input name="inventory" type="number" min={0} disabled={prize.is_thank_you} defaultValue={prize.inventory_total ?? ""} placeholder="Unlimited" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 disabled:opacity-40" /></div><div><label className="text-xs text-zinc-500">Position</label><input name="position" type="number" min={0} max={99} defaultValue={prize.position} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3" /></div><div className="lg:col-span-3"><ImageUploadField id={`prize-${prize.id}`} label="Prize image" currentUrl={prize.image_path} /></div><div className="flex flex-col justify-end gap-3"><label className="text-sm"><input name="isThankYou" type="checkbox" defaultChecked={prize.is_thank_you} className="mr-2" />Thank You</label><label className="text-sm"><input name="isActive" type="checkbox" defaultChecked={prize.is_active} className="mr-2" />Active</label></div>{editable && <div className="flex items-end gap-3"><button className="h-11 flex-1 rounded-xl bg-yellow-400 font-black text-black">Save</button><button formAction={setSpinPrizeStatus} name="isActive" value={String(!prize.is_active)} className="h-11 rounded-xl border border-white/10 px-4 text-xs text-zinc-300">{prize.is_active ? "Disable" : "Enable"}</button><input type="hidden" name="prizeId" value={prize.id} /></div>}</form>)}
      </div>

      {editable && prizes.filter((item) => !item.is_thank_you).length < 12 && <form action={saveSpinPrize} className="mt-6 grid gap-4 rounded-[24px] border border-dashed border-yellow-400/25 bg-yellow-400/[0.04] p-5 lg:grid-cols-4"><input type="hidden" name="campaignId" value={campaign.id} /><div><label className="text-xs text-zinc-500">New segment name</label><input name="name" required placeholder="RM10 Reward" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3" /></div><div><label className="text-xs text-zinc-500">Weight</label><input name="weight" type="number" step="0.0001" min="0.0001" defaultValue="10" required className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3" /></div><div><label className="text-xs text-zinc-500">Inventory (blank = unlimited)</label><input name="inventory" type="number" min={0} placeholder="Unlimited" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3" /></div><div><label className="text-xs text-zinc-500">Position</label><input name="position" type="number" min={0} max={99} defaultValue={prizes.length} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3" /></div><label className="text-sm"><input name="isThankYou" type="checkbox" className="mr-2" />Thank You segment</label><label className="text-sm"><input name="isActive" type="checkbox" defaultChecked className="mr-2" />Active</label><div className="lg:col-span-2"><ImageUploadField id="new-prize" label="Prize image" /></div><button className="h-11 rounded-xl bg-yellow-400 font-black text-black lg:col-start-4">Add segment</button></form>}

      <div className="mt-12 rounded-[28px] border border-white/10 bg-white/[0.04] p-6"><h2 className="text-xl font-black">Recent spins</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-xs uppercase text-zinc-600"><tr><th className="pb-3">Member</th><th>Result</th><th>Points</th><th>Claim</th><th>Time</th></tr></thead><tbody className="divide-y divide-white/10">{(resultsResult.data ?? []).map((result) => { const member = Array.isArray(result.member_profiles) ? result.member_profiles[0] : result.member_profiles; const prize = Array.isArray(result.spin_prizes) ? result.spin_prizes[0] : result.spin_prizes; const claim = Array.isArray(result.reward_claims) ? result.reward_claims[0] : result.reward_claims; return <tr key={result.id}><td className="py-4"><strong>{member?.full_name ?? "Member"}</strong><br/><span className="text-xs text-zinc-600">{member?.phone ? displayMalaysianPhone(member.phone) : ""}</span></td><td className={result.is_winner ? "text-emerald-300" : "text-zinc-500"}>{prize?.name}</td><td>-{result.points_spent}</td><td className="font-mono text-xs">{claim?.claim_code ?? "—"} {claim?.status ? `(${claim.status})` : ""}</td><td className="text-xs text-zinc-500">{formatMalaysiaDateTime(result.created_at)}</td></tr>; })}</tbody></table></div></div>
    </section>
  );
}
