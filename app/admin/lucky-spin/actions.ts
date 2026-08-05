"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireContentEditor } from "@/lib/admin/access";
import { uploadEngagementImage } from "@/lib/admin/engagement-image";
import { createAdminClient } from "@/lib/supabase/admin";

function malaysiaLocalToIso(value: string) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}:00+08:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function refreshSpinPages() {
  revalidatePath("/admin/lucky-spin"); revalidatePath("/member/lucky-spin"); revalidatePath("/member");
}

export async function updateSpinCampaign(formData: FormData) {
  const admin = await requireContentEditor("/admin/lucky-spin?error=forbidden");
  const campaignId = String(formData.get("campaignId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const pointsPerSpin = Number(formData.get("pointsPerSpin"));
  const dailyLimit = Number(formData.get("dailyLimit"));
  const startsAt = malaysiaLocalToIso(String(formData.get("startsAt") ?? ""));
  const endsAt = malaysiaLocalToIso(String(formData.get("endsAt") ?? ""));
  const isActive = formData.get("isActive") === "on";
  if (!/^[0-9a-f-]{36}$/i.test(campaignId) || name.length < 2 || name.length > 100 || !Number.isInteger(pointsPerSpin) || pointsPerSpin < 1 || pointsPerSpin > 1000000 || !Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 3 || startsAt === undefined || endsAt === undefined || (startsAt && endsAt && endsAt <= startsAt)) redirect("/admin/lucky-spin?error=invalid");
  const client = createAdminClient();
  if (isActive) {
    const { data: prizes } = await client.from("spin_prizes").select("id, is_thank_you").eq("campaign_id", campaignId).eq("is_active", true);
    if (!prizes || prizes.length < 2 || !prizes.some((prize) => prize.is_thank_you)) redirect("/admin/lucky-spin?error=prizes_required");
  }
  const upload = await uploadEngagementImage(formData, "spin-backgrounds");
  if (upload.error) redirect(`/admin/lucky-spin?error=${upload.error}`);
  const { error } = await client.from("spin_campaigns").update({ name, points_per_spin: pointsPerSpin, daily_limit: dailyLimit, starts_at: startsAt, ends_at: endsAt, is_active: isActive, updated_by: admin.id, updated_at: new Date().toISOString(), ...(upload.url ? { background_image_path: upload.url } : {}) }).eq("id", campaignId);
  if (error) { console.error("Spin campaign update failed:", error.message); redirect("/admin/lucky-spin?error=server"); }
  refreshSpinPages(); redirect("/admin/lucky-spin?success=campaign");
}

export async function uploadSpinLogo(formData: FormData) {
  const admin = await requireContentEditor("/admin/lucky-spin?error=forbidden");
  const campaignId = String(formData.get("campaignId") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(campaignId)) redirect("/admin/lucky-spin?error=invalid");
  const upload = await uploadEngagementImage(formData, "spin-logos");
  if (upload.error || !upload.url) redirect(`/admin/lucky-spin?error=${upload.error ?? "invalid_image"}`);
  const client = createAdminClient();
  const { error } = await client.from("spin_campaigns").update({ logo_path: upload.url, updated_by: admin.id, updated_at: new Date().toISOString() }).eq("id", campaignId);
  if (error) redirect("/admin/lucky-spin?error=server");
  refreshSpinPages(); redirect("/admin/lucky-spin?success=logo");
}

export async function saveSpinPrize(formData: FormData) {
  await requireContentEditor("/admin/lucky-spin?error=forbidden");
  const prizeId = String(formData.get("prizeId") ?? "");
  const campaignId = String(formData.get("campaignId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const weight = Number(formData.get("weight"));
  const position = Number(formData.get("position"));
  const thankYou = formData.get("isThankYou") === "on";
  const inventoryText = String(formData.get("inventory") ?? "").trim();
  const inventory = thankYou || inventoryText === "" ? null : Number(inventoryText);
  if (!/^[0-9a-f-]{36}$/i.test(campaignId) || name.length < 2 || name.length > 100 || !Number.isFinite(weight) || weight <= 0 || weight > 1000000 || !Number.isInteger(position) || position < 0 || position > 99 || (inventory !== null && (!Number.isInteger(inventory) || inventory < 0))) redirect("/admin/lucky-spin?error=invalid");
  const upload = await uploadEngagementImage(formData, "spin-prizes");
  if (upload.error) redirect(`/admin/lucky-spin?error=${upload.error}`);
  const payload = { campaign_id: campaignId, name, weight, position, is_thank_you: thankYou, inventory_total: inventory, inventory_remaining: inventory, is_active: formData.get("isActive") === "on", updated_at: new Date().toISOString(), ...(upload.url ? { image_path: upload.url } : {}) };
  const client = createAdminClient();
  const operation = prizeId ? client.from("spin_prizes").update(payload).eq("id", prizeId) : client.from("spin_prizes").insert(payload);
  const { error } = await operation;
  if (error) { console.error("Spin prize save failed:", error.message); redirect(`/admin/lucky-spin?error=${error.code === "23505" ? "duplicate_thank_you" : "server"}`); }
  refreshSpinPages(); redirect("/admin/lucky-spin?success=prize");
}

export async function setSpinPrizeStatus(formData: FormData) {
  await requireContentEditor("/admin/lucky-spin?error=forbidden");
  const prizeId = String(formData.get("prizeId") ?? "");
  const requestedValues = formData.getAll("isActive");
  const isActive = String(requestedValues.at(-1) ?? "") === "true";
  if (!/^[0-9a-f-]{36}$/i.test(prizeId)) redirect("/admin/lucky-spin?error=invalid");
  const client = createAdminClient();
  const { error } = await client.from("spin_prizes").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", prizeId);
  if (error) redirect("/admin/lucky-spin?error=server");
  refreshSpinPages(); redirect("/admin/lucky-spin?success=prize_status");
}

export async function updateSpinClaimStatus(formData: FormData) {
  const admin = await requireContentEditor("/admin/lucky-spin?error=forbidden");
  const claimId = String(formData.get("claimId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(claimId) || !["pending", "fulfilled", "cancelled"].includes(status)) redirect("/admin/lucky-spin?error=invalid");

  const { data, error } = await createAdminClient()
    .from("reward_claims")
    .update({
      status,
      fulfilled_by: status === "fulfilled" ? admin.id : null,
      fulfilled_at: status === "fulfilled" ? new Date().toISOString() : null,
    })
    .eq("id", claimId)
    .eq("source_type", "lucky_spin")
    .select("id")
    .maybeSingle();

  if (error || !data) redirect("/admin/lucky-spin?error=claim_update");
  revalidatePath("/admin/lucky-spin");
  revalidatePath("/admin/daily-rewards");
  revalidatePath("/member/rewards");
  redirect("/admin/lucky-spin?success=claim_status");
}
