import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const flowId = requestUrl.searchParams.get("sb_flow_id");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );

    if (!error) {
      return NextResponse.redirect(
        new URL("/auth/update-password", requestUrl.origin),
      );
    }

    console.error("Password recovery code exchange failed:", error.message);
  }

  return NextResponse.redirect(
    new URL("/auth/login?error=recovery", requestUrl.origin),
  );
}
