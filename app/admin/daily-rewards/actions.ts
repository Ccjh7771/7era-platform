"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireContentEditor } from "@/lib/admin/access";
import { recordAdminAudit } from "@/lib/admin/audit";
import { uploadEngagementImage } from "@/lib/admin/engagement-image";
import { createAdminClient } from "@/lib/supabase/admin";

const rewardTypes = new Set(["points", "prize", "welcome_bonus", "double_points", "free_spin", "custom"]);

export async function updateDailyRewardSettings(formData: FormData) {
  const admin = await requireContentEditor("/admin/daily-rewards?error=forbidden");
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const cycleLength = Number(formData.get("cycleLength"));
  if (title.length < 2 || title.length > 100 || subtitle.length > 300 || !Number.isInteger(cycleLength) || cycleLength < 1 || cycleLength > 31) redirect("/admin/daily-rewards?error=invalid");
  const client = createAdminClient();
  const { error } = await client.from("daily_reward_settings").update({ title, subtitle, cycle_length: cycleLength, is_enabled: formData.get("isEnabled") === "on", updated_by: admin.id, updated_at: new Date().toISOString() }).eq("id", 1);
  if (error) redirect("/admin/daily-rewards?error=server");
  await recordAdminAudit({
    actor: admin,
    action: "daily_reward_settings_updated",
    targetType: "daily_reward",
    targetId: "settings",
    summary: `Updated the ${cycleLength}-day reward cycle settings.`,
    metadata: { cycleLength, enabled: formData.get("isEnabled") === "on" },
  });
  revalidatePath("/member"); revalidatePath("/admin/daily-rewards");
  redirect("/admin/daily-rewards?success=settings");
}

export async function saveDailyRewardItem(formData: FormData) {
  const admin = await requireContentEditor("/admin/daily-rewards?error=forbidden");
  const itemId = String(formData.get("itemId") ?? "");
  const dayNumber = Number(formData.get("dayNumber"));
  const rewardType = String(formData.get("rewardType") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const pointsAmount = Number(formData.get("pointsAmount") ?? 0);
  const inventoryText = String(formData.get("inventory") ?? "").trim();
  const inventory = inventoryText === "" ? null : Number(inventoryText);
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 31 || !rewardTypes.has(rewardType) || label.length < 2 || label.length > 100 || description.length > 300 || !Number.isInteger(pointsAmount) || pointsAmount < 0 || pointsAmount > 1000000 || (inventory !== null && (!Number.isInteger(inventory) || inventory < 0))) redirect("/admin/daily-rewards?error=invalid");
  const upload = await uploadEngagementImage(formData, "daily-rewards");
  if (upload.error) redirect(`/admin/daily-rewards?error=${upload.error}`);
  const client = createAdminClient();
  const payload = { day_number: dayNumber, reward_type: rewardType, label, description, points_amount: pointsAmount, inventory_total: inventory, inventory_remaining: inventory, is_active: formData.get("isActive") === "on", updated_at: new Date().toISOString(), ...(upload.url ? { image_path: upload.url } : {}) };
  const operation = itemId ? client.from("daily_reward_items").update(payload).eq("id", itemId) : client.from("daily_reward_items").insert(payload);
  const { error } = await operation;
  if (error) { console.error("Daily item update failed:", error.message); redirect("/admin/daily-rewards?error=server"); }
  await recordAdminAudit({
    actor: admin,
    action: itemId ? "daily_reward_item_updated" : "daily_reward_item_created",
    targetType: "daily_reward_item",
    targetId: itemId || `day-${dayNumber}`,
    summary: `${itemId ? "Updated" : "Created"} Day ${dayNumber} reward: ${label}.`,
    metadata: { dayNumber, rewardType, pointsAmount },
  });
  revalidatePath("/member"); revalidatePath("/admin/daily-rewards");
  redirect("/admin/daily-rewards?success=item");
}

export async function updateClaimStatus(formData: FormData) {
  const admin = await requireContentEditor("/admin/daily-rewards?error=forbidden");
  const claimId = String(formData.get("claimId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(claimId) || !["fulfilled", "cancelled", "pending"].includes(status)) redirect("/admin/daily-rewards?error=invalid");
  const client = createAdminClient();
  const { data, error } = await client
    .from("reward_claims")
    .update({ status, fulfilled_by: status === "fulfilled" ? admin.id : null, fulfilled_at: status === "fulfilled" ? new Date().toISOString() : null })
    .eq("id", claimId)
    .eq("source_type", "daily_reward")
    .select("id")
    .maybeSingle();
  if (error || !data) redirect("/admin/daily-rewards?error=server");
  await recordAdminAudit({
    actor: admin,
    action: "daily_reward_claim_status_changed",
    targetType: "reward_claim",
    targetId: claimId,
    summary: `Changed a Daily Reward claim to ${status}.`,
    metadata: { status },
  });
  revalidatePath("/admin/daily-rewards"); revalidatePath("/admin/lucky-spin"); revalidatePath("/member/rewards");
  redirect("/admin/daily-rewards?success=claim");
}
