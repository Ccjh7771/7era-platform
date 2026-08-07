import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";

const REGISTRATION_LIMIT = 10;
const REGISTRATION_WINDOW_MS = 60 * 60 * 1000;
const RETENTION_MS = 48 * 60 * 60 * 1000;

export async function checkMemberRegistrationRateLimit() {
  const requestHeaders = await headers();
  const forwardedFor =
    requestHeaders.get("x-vercel-forwarded-for") ??
    requestHeaders.get("x-forwarded-for") ??
    requestHeaders.get("x-real-ip");
  const clientIp = forwardedFor?.split(",")[0]?.trim();

  // Vercel supplies a forwarded IP in production. Fail open if another runtime
  // does not provide one so local development and legitimate registration work.
  if (!clientIp) {
    return { allowed: true };
  }

  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    console.error("Registration rate limit is missing its server-side hash secret.");
    return { allowed: true };
  }

  const now = Date.now();
  const ipHash = createHash("sha256")
    .update(`${secret}:${clientIp}`)
    .digest("hex");
  const client = createAdminClient();

  const { error: insertError } = await client
    .from("member_registration_attempts")
    .insert({ ip_hash: ipHash });

  if (insertError) {
    console.error("Unable to record member registration rate limit:", insertError.message);
    return { allowed: true };
  }

  const { count, error: countError } = await client
    .from("member_registration_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", new Date(now - REGISTRATION_WINDOW_MS).toISOString());

  if (countError) {
    console.error("Unable to check member registration rate limit:", countError.message);
    return { allowed: true };
  }

  // Cleanup is best effort and only removes short-lived internal rate-limit rows.
  const { error: cleanupError } = await client
    .from("member_registration_attempts")
    .delete()
    .lt("created_at", new Date(now - RETENTION_MS).toISOString());

  if (cleanupError) {
    console.error("Unable to clean member registration rate limits:", cleanupError.message);
  }

  return { allowed: (count ?? 0) <= REGISTRATION_LIMIT };
}
