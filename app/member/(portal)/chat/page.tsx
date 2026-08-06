import { requireMember } from "@/lib/member/access";
import { createClient } from "@/lib/supabase/server";

import { MemberChat } from "./MemberChat";

export default async function MemberChatPage() {
  const member = await requireMember();
  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("chat_conversations")
    .select("id, subject, status, last_message_at, member_last_read_at")
    .eq("member_id", member.id)
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const messagesResult = conversation
    ? await supabase
        .from("chat_messages")
        .select("id, conversation_id, sender_id, sender_type, body, is_internal, attachment_path, attachment_mime_type, created_at")
        .eq("conversation_id", conversation.id)
        .order("created_at")
    : { data: [] };

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">Direct support</p>
      <h1 className="mt-3 text-3xl font-black">7ERA Live Chat</h1>
      <p className="mb-5 mt-2 text-sm text-zinc-500 sm:mb-8">Messages are handled by our own support team inside 7ERA.</p>
      <MemberChat
        memberId={member.id}
        initialConversation={(conversation ?? null) as never}
        initialMessages={(messagesResult.data ?? []) as never[]}
      />
    </section>
  );
}
