import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/admin/access";
import { displayMalaysianPhone } from "@/lib/member/phone";
import { formatMalaysiaDateTime } from "@/lib/member/time";
import { createAdminClient } from "@/lib/supabase/admin";

type MemberDetailPageProps = { params: Promise<{ memberId: string }> };

function one<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function AdminMemberDetailPage({ params }: MemberDetailPageProps) {
  await requireAdmin();
  const { memberId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(memberId)) notFound();

  const client = createAdminClient();
  const [profileResult, pointsResult, dailyResult, spinsResult, winsResult, rewardsResult, pendingRewardsResult, chatsResult] = await Promise.all([
    client.from("member_profiles").select("id, full_name, phone, status, must_change_password, points_balance, avatar_path, last_login_at, created_at").eq("id", memberId).maybeSingle(),
    client.from("point_transactions").select("id, amount, balance_after, transaction_type, note, created_at", { count: "exact" }).eq("member_id", memberId).order("created_at", { ascending: false }).limit(50),
    client.from("daily_reward_claims").select("id, cycle_day, points_awarded, created_at, daily_reward_items(label, reward_type)", { count: "exact" }).eq("member_id", memberId).order("created_at", { ascending: false }).limit(30),
    client.from("spin_results").select("id, is_winner, points_spent, created_at, spin_prizes(name), reward_claims(claim_code, status)", { count: "exact" }).eq("member_id", memberId).order("created_at", { ascending: false }).limit(30),
    client.from("spin_results").select("id", { count: "exact", head: true }).eq("member_id", memberId).eq("is_winner", true),
    client.from("reward_claims").select("id, reward_name, claim_code, source_type, status, fulfilled_at, created_at", { count: "exact" }).eq("member_id", memberId).order("created_at", { ascending: false }).limit(30),
    client.from("reward_claims").select("id", { count: "exact", head: true }).eq("member_id", memberId).eq("status", "pending"),
    client.from("chat_conversations").select("id, subject, status, last_message_at, created_at", { count: "exact" }).eq("member_id", memberId).order("last_message_at", { ascending: false }).limit(20),
  ]);

  if (!profileResult.data) notFound();
  const activityError = [pointsResult.error, dailyResult.error, spinsResult.error, winsResult.error, rewardsResult.error, pendingRewardsResult.error, chatsResult.error].find(Boolean);
  if (activityError) throw new Error(`Unable to load member activity: ${activityError.message}`);

  const profile = profileResult.data;
  const points = pointsResult.data ?? [];
  const dailyClaims = dailyResult.data ?? [];
  const spins = spinsResult.data ?? [];
  const rewards = rewardsResult.data ?? [];
  const chats = chatsResult.data ?? [];

  return (
    <section>
      <Link href="/admin/members" prefetch={false} className="text-sm font-bold text-yellow-300">← Back to members</Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">Member profile</p>
          <h1 className="mt-3 text-3xl font-black">{profile.full_name}</h1>
          <p className="mt-2 text-sm text-zinc-400">{displayMalaysianPhone(profile.phone)}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-yellow-300">{Number(profile.points_balance).toLocaleString("en-MY")} PTS</p>
          <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase ${profile.status === "active" ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>{profile.status}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ProfileField label="Member ID" value={profile.id} mono />
        <ProfileField label="Registered" value={formatMalaysiaDateTime(profile.created_at)} />
        <ProfileField label="Last login" value={profile.last_login_at ? formatMalaysiaDateTime(profile.last_login_at) : "Never"} />
        <ProfileField label="Password status" value={profile.must_change_password ? "Update required" : "Ready"} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Daily check-ins" value={dailyResult.count ?? 0} />
        <StatCard label="Lucky Spins" value={spinsResult.count ?? 0} />
        <StatCard label="Wins" value={winsResult.count ?? 0} tone="success" />
        <StatCard label="Pending rewards" value={pendingRewardsResult.count ?? 0} tone="warning" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <ActivitySection title="Points history" subtitle={`${pointsResult.count ?? 0} total transactions`}>
          {points.length === 0 ? <EmptyState label="No points activity." /> : points.map((entry) => (
            <article key={entry.id} className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div><strong className="text-sm">{entry.note || entry.transaction_type.replaceAll("_", " ")}</strong><time dateTime={entry.created_at} className="mt-1 block text-xs text-zinc-600">{formatMalaysiaDateTime(entry.created_at)}</time></div>
              <div className="text-right"><span className={`font-black ${entry.amount > 0 ? "text-emerald-300" : "text-red-300"}`}>{entry.amount > 0 ? "+" : ""}{entry.amount}</span><span className="mt-1 block text-xs text-zinc-600">Balance {entry.balance_after}</span></div>
            </article>
          ))}
        </ActivitySection>

        <ActivitySection title="Prize claims" subtitle={`${rewardsResult.count ?? 0} total claims`}>
          {rewards.length === 0 ? <EmptyState label="No prize claims." /> : rewards.map((reward) => (
            <article key={reward.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-start justify-between gap-3"><strong className="text-sm">{reward.reward_name}</strong><StatusBadge status={reward.status} /></div>
              <p className="mt-2 font-mono text-xs text-emerald-300">{reward.claim_code}</p>
              <p className="mt-2 text-xs text-zinc-600">{reward.source_type.replaceAll("_", " ")} · {formatMalaysiaDateTime(reward.created_at)}</p>
            </article>
          ))}
        </ActivitySection>

        <ActivitySection title="Daily Check-in history" subtitle={`${dailyResult.count ?? 0} total check-ins`}>
          {dailyClaims.length === 0 ? <EmptyState label="No Daily Check-ins." /> : dailyClaims.map((claim) => {
            const reward = one(claim.daily_reward_items);
            return <article key={claim.id} className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4"><div><strong className="text-sm">Day {claim.cycle_day} · {reward?.label ?? "Daily Reward"}</strong><time dateTime={claim.created_at} className="mt-1 block text-xs text-zinc-600">{formatMalaysiaDateTime(claim.created_at)}</time></div><span className="font-black text-emerald-300">+{claim.points_awarded} PTS</span></article>;
          })}
        </ActivitySection>

        <ActivitySection title="Lucky Spin history" subtitle={`${spinsResult.count ?? 0} total spins`}>
          {spins.length === 0 ? <EmptyState label="No Lucky Spins." /> : spins.map((spin) => {
            const prize = one(spin.spin_prizes);
            const claim = one(spin.reward_claims);
            return <article key={spin.id} className="rounded-2xl border border-white/10 bg-black/30 p-4"><div className="flex items-start justify-between gap-3"><strong className={`text-sm ${spin.is_winner ? "text-emerald-300" : "text-zinc-400"}`}>{prize?.name ?? "Spin result"}</strong><span className="text-xs text-red-300">-{spin.points_spent} PTS</span></div><p className="mt-2 text-xs text-zinc-600">{formatMalaysiaDateTime(spin.created_at)}{claim ? ` · ${claim.claim_code} · ${claim.status}` : ""}</p></article>;
          })}
        </ActivitySection>

        <ActivitySection title="Live Chat history" subtitle={`${chatsResult.count ?? 0} total conversations`} wide>
          {chats.length === 0 ? <EmptyState label="No Live Chat conversations." /> : chats.map((chat) => (
            <article key={chat.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div><strong className="text-sm">{chat.subject}</strong><time dateTime={chat.last_message_at} className="mt-1 block text-xs text-zinc-600">Last message {formatMalaysiaDateTime(chat.last_message_at)}</time></div><StatusBadge status={chat.status} />
            </article>
          ))}
          {chats.length > 0 ? <Link href="/admin/live-chat" prefetch={false} className="inline-flex rounded-xl border border-yellow-400/20 px-4 py-2 text-xs font-bold text-yellow-300">Open Live Chat workspace</Link> : null}
        </ActivitySection>
      </div>
    </section>
  );
}

function ProfileField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-zinc-600">{label}</p><p className={`mt-2 break-all text-sm font-bold text-zinc-200 ${mono ? "font-mono text-xs" : ""}`}>{value}</p></div>;
}

function StatCard({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "success" | "warning" }) {
  const toneClass = tone === "success" ? "text-emerald-300" : tone === "warning" ? "text-yellow-300" : "";
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-zinc-500">{label}</p><strong className={`mt-2 block text-2xl ${toneClass}`}>{value.toLocaleString("en-MY")}</strong></div>;
}

function ActivitySection({ title, subtitle, wide = false, children }: { title: string; subtitle: string; wide?: boolean; children: React.ReactNode }) {
  return <section className={`rounded-[24px] border border-white/10 bg-white/[0.04] p-5 sm:p-6 ${wide ? "xl:col-span-2" : ""}`}><div><h2 className="text-xl font-black">{title}</h2><p className="mt-1 text-xs text-zinc-600">{subtitle} · Malaysia time</p></div><div className="mt-5 space-y-3">{children}</div></section>;
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "fulfilled" || status === "closed" ? "bg-emerald-400/10 text-emerald-300" : status === "cancelled" ? "bg-red-400/10 text-red-300" : "bg-yellow-400/10 text-yellow-300";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${tone}`}>{status}</span>;
}

function EmptyState({ label }: { label: string }) {
  return <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-zinc-500">{label}</p>;
}
