import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const messageId = new URL(request.url).searchParams.get("message");

  if (!messageId || !/^[0-9a-f-]{36}$/i.test(messageId)) {
    return new Response("Invalid attachment", { status: 400 });
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: message } = await supabase
    .from("chat_messages")
    .select("attachment_path, attachment_mime_type")
    .eq("id", messageId)
    .not("attachment_path", "is", null)
    .maybeSingle();

  if (!message?.attachment_path || !message.attachment_mime_type) {
    return new Response("Attachment not found", { status: 404 });
  }

  const { data: file, error: downloadError } = await createAdminClient().storage
    .from("chat-attachments")
    .download(message.attachment_path);

  if (downloadError || !file) {
    return new Response("Attachment not found", { status: 404 });
  }

  return new Response(file, {
    headers: {
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": "inline",
      "Content-Type": message.attachment_mime_type,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
