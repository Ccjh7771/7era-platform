import { requireMember } from "@/lib/member/access";
import { formatMalaysiaDateTime } from "@/lib/member/time";
import { createClient } from "@/lib/supabase/server";

export default async function MemberRewardsPage() {
  const member = await requireMember();
  const supabase = await createClient();
  const [rewardsResult, transactionsResult] = await Promise.all([
    supabase.from("reward_claims").select("id, reward_name, claim_code, status, created_at").eq("member_id", member.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("point_transactions").select("id, amount, balance_after, transaction_type, note, created_at").eq("member_id", member.id).order("created_at", { ascending: false }).limit(50),
  ]);

  const rewards = rewardsResult.data ?? [];
  const transactions = transactionsResult.data ?? [];

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">Member history</p>
      <h1 className="mt-3 text-3xl font-black">My Rewards</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-black">Prize claims</h2>
          <div className="mt-5 space-y-3">
            {rewards.length === 0 && <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-zinc-500">No prize claims yet.</p>}
            {rewards.map((reward) => <article key={reward.id} className="rounded-2xl border border-white/10 bg-black/30 p-4"><div className="flex justify-between gap-3"><strong>{reward.reward_name}</strong><span className="text-xs font-black uppercase text-yellow-300">{reward.status}</span></div><p className="mt-2 font-mono text-sm text-emerald-300">{reward.claim_code}</p><p className="mt-2 text-xs text-zinc-600">{formatMalaysiaDateTime(reward.created_at)}</p></article>)}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-black">Points history</h2>
          <div className="mt-5 space-y-3">
            {transactions.length === 0 && <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-zinc-500">No points activity yet.</p>}
            {transactions.map((entry) => <article key={entry.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4"><div><p className="font-semibold">{entry.note || entry.transaction_type.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-zinc-600">{formatMalaysiaDateTime(entry.created_at)}</p></div><div className="text-right"><p className={`font-black ${entry.amount > 0 ? "text-emerald-300" : "text-red-300"}`}>{entry.amount > 0 ? "+" : ""}{entry.amount}</p><p className="text-xs text-zinc-600">Balance {entry.balance_after}</p></div></article>)}
          </div>
        </div>
      </div>
    </section>
  );
}
