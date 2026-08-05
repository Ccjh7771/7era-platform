import { requireMember } from "@/lib/member/access";
import { createClient } from "@/lib/supabase/server";

import { MemberChat } from "./MemberChat";

export default async function MemberChatPage() {
  const member = await requireMember();
  const supabase = await createClient();
  const { data: conversations } = await supabase.from("chat_conversations").select("id, subject, status, last_message_at, member_last_read_at").eq("member_id", member.id).order("last_message_at", { ascending: false });
  const ids = (conversations ?? []).map((conversation) => conversation.id);
  const messagesResult = ids.length > 0
    ? await supabase.from("chat_messages").select("id, conversation_id, sender_id, sender_type, body, is_internal, created_at").in("conversation_id", ids).order("created_at")
    : { data: [] };

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">Direct support</p>
      <h1 className="mt-3 text-3xl font-black">7ERA Live Chat</h1>
      <p className="mb-8 mt-2 text-sm text-zinc-500">Messages are handled by our own support team inside 7ERA.</p>
      <MemberChat memberId={member.id} initialConversations={(conversations ?? []) as never[]} initialMessages={(messagesResult.data ?? []) as never[]} />
    </section>
  );
}
