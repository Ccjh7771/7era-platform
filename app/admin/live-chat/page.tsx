import { requireAdmin } from "@/lib/admin/access";
import { displayMalaysianPhone } from "@/lib/member/phone";
import { createAdminClient } from "@/lib/supabase/admin";

import { AdminLiveChat } from "./AdminLiveChat";

export default async function AdminLiveChatPage() {
  const admin = await requireAdmin();
  const client = createAdminClient();
  const [conversationsResult, staffResult] = await Promise.all([
    client.from("chat_conversations").select("id, member_id, subject, status, assigned_admin_id, last_message_at, admin_last_read_at, member_profiles(full_name, phone)").order("last_message_at", { ascending: false }).limit(250),
    client.from("admin_profiles").select("id, full_name").eq("is_active", true).order("full_name"),
  ]);
  const conversations = (conversationsResult.data ?? []).map((conversation) => {
    const member = Array.isArray(conversation.member_profiles) ? conversation.member_profiles[0] : conversation.member_profiles;
    return { id: conversation.id, member_id: conversation.member_id, subject: conversation.subject, status: conversation.status, assigned_admin_id: conversation.assigned_admin_id, last_message_at: conversation.last_message_at, admin_last_read_at: conversation.admin_last_read_at, memberName: member?.full_name ?? "Member", memberPhone: member?.phone ? displayMalaysianPhone(member.phone) : "" };
  });
  const ids = conversations.map((conversation) => conversation.id);
  const messagesResult = ids.length ? await client.from("chat_messages").select("id, conversation_id, sender_id, sender_type, body, is_internal, created_at").in("conversation_id", ids).order("created_at").limit(2000) : { data: [] };
  const staff = (staffResult.data ?? []).map((person) => ({ id: person.id, fullName: person.full_name }));

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-300">Owned support channel</p>
      <h1 className="mt-3 text-3xl font-black">Live Chat Workspace</h1>
      <p className="mb-5 mt-2 text-sm text-zinc-500 sm:mb-8">Multiple staff can reply at the same time. Assignment and internal notes keep teamwork organized.</p>
      <AdminLiveChat adminId={admin.id} canReply={admin.role !== "viewer"} initialConversations={conversations as never[]} initialMessages={(messagesResult.data ?? []) as never[]} staff={staff} />
    </section>
  );
}
