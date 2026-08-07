import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
};

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("website_settings")
      .select("id")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return Response.json(
      {
        status: "ok",
        checks: {
          application: "ok",
          database: "ok",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200, headers: responseHeaders },
    );
  } catch {
    return Response.json(
      {
        status: "degraded",
        checks: {
          application: "ok",
          database: "unavailable",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: responseHeaders },
    );
  }
}
