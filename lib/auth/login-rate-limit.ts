import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";

type LoginScope = "member" | "admin";

const WINDOW_MS = 15 * 60 * 1000;
const RETENTION_MS = 48 * 60 * 60 * 1000;
const ATTEMPT_LIMITS: Record<LoginScope, number> = {
  member: 20,
  admin: 10,
};

type LoginRateLimit = {
  allowed: boolean;
  recordFailure: () => Promise<void>;
  clearFailures: () => Promise<void>;
};

const unrestricted: LoginRateLimit = {
  allowed: true,
  recordFailure: async () => undefined,
  clearFailures: async () => undefined,
};

export async function checkLoginRateLimit(
  scope: LoginScope,
): Promise<LoginRateLimit> {
  const requestHeaders = await headers();
  const forwardedFor =
    requestHeaders.get("x-vercel-forwarded-for") ??
    requestHeaders.get("x-forwarded-for") ??
    requestHeaders.get("x-real-ip");
  const clientIp = forwardedFor?.split(",")[0]?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!clientIp) {
    return unrestricted;
  }

  if (!secret) {
    console.error("Login rate limit is missing its server-side hash secret.");
    return unrestricted;
  }

  const now = Date.now();
  const ipHash = createHash("sha256")
    .update(`${secret}:login:${clientIp}`)
    .digest("hex");
  const client = createAdminClient();
  const { count, error: countError } = await client
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("login_scope", scope)
    .eq("ip_hash", ipHash)
    .gte("created_at", new Date(now - WINDOW_MS).toISOString());

  if (countError) {
    console.error("Unable to check login rate limit:", countError.message);
    return unrestricted;
  }

  const { error: cleanupError } = await client
    .from("login_attempts")
    .delete()
    .lt("created_at", new Date(now - RETENTION_MS).toISOString());

  if (cleanupError) {
    console.error("Unable to clean login rate limits:", cleanupError.message);
  }

  return {
    allowed: (count ?? 0) < ATTEMPT_LIMITS[scope],
    recordFailure: async () => {
      const { error } = await client
        .from("login_attempts")
        .insert({ login_scope: scope, ip_hash: ipHash });

      if (error) {
        console.error("Unable to record failed login:", error.message);
      }
    },
    clearFailures: async () => {
      const { error } = await client
        .from("login_attempts")
        .delete()
        .eq("login_scope", scope)
        .eq("ip_hash", ipHash);

      if (error) {
        console.error("Unable to clear login failures:", error.message);
      }
    },
  };
}
