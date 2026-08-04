import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type MemberProfile = {
  id: string;
  phone: string;
  fullName: string;
  pointsBalance: number;
};

export const requireMember = cache(async (): Promise<MemberProfile> => {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/member/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("member_profiles")
    .select("phone, full_name, status, must_change_password, points_balance")
    .eq("id", userId)
    .single();

  if (profileError || !profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirect("/member/login?error=inactive");
  }

  if (profile.must_change_password) {
    redirect("/member/change-password?required=1");
  }

  return {
    id: userId,
    phone: profile.phone,
    fullName: profile.full_name,
    pointsBalance: Number(profile.points_balance),
  };
});
