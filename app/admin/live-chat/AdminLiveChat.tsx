"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { displayMalaysianPhone } from "@/lib/member/phone";
import { createClient } from "@/lib/supabase/client";

import { markAdminConversationRead } from "./actions";

type Conversation = { id: string; member_id: string; subject: string; status: "open" | "in_progress" | "closed"; assigned_admin_id: string | null; last_message_at: string; admin_last_read_at: string | null; memberName: string; memberPhone: string };
type Message = { id: string; conversation_id: string; sender_id: string; sender_type: "member" | "admin" | "system"; body: string; is_internal: boolean; created_at: string };
type Staff = { id: string; fullName: string };

export function AdminLiveChat({ adminId, canReply, initialConversations, initialMessages, staff }: { adminId: string; canReply: boolean; initialConversations: Conversation[]; initialMessages: Message[]; staff: Staff[] }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase.channel("admin-live-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const message = payload.new as Message;
        setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_conversations" }, async (payload) => {
        const conversation = payload.new as Omit<Conversation, "memberName" | "memberPhone">;
        const { data: member } = await supabase.from("member_profiles").select("full_name, phone").eq("id", conversation.member_id).maybeSingle();
        const hydrated = { ...conversation, memberName: member?.full_name ?? "Member", memberPhone: member?.phone ? displayMalaysianPhone(member.phone) : "" };
        setConversations((current) => current.some((item) => item.id === conversation.id) ? current : [hydrated, ...current]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_conversations" }, (payload) => {
        const updated = payload.new as Conversation;
        setConversations((current) => [...current.map((item) => item.id === updated.id ? { ...item, ...updated } : item)].sort((a, b) => Date.parse(b.last_message_at) - Date.parse(a.last_message_at)));
      }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [supabase]);

  useEffect(() => {
    if (!selectedId) return;
    void markAdminConversationRead(selectedId);
  }, [messages.length, selectedId]);

  const unreadCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const conversationsById = new Map(conversations.map((conversation) => [conversation.id, conversation]));
    for (const message of messages) {
      if (message.sender_type !== "member") continue;
      const conversation = conversationsById.get(message.conversation_id);
      if (!conversation?.admin_last_read_at || Date.parse(message.created_at) > Date.parse(conversation.admin_last_read_at)) {
        counts.set(message.conversation_id, (counts.get(message.conversation_id) ?? 0) + 1);
      }
    }
    return counts;
  }, [conversations, messages]);

  const selected = conversations.find((item) => item.id === selectedId);
  const visibleMessages = messages.filter((item) => item.conversation_id === selectedId);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!canReply || !selectedId || !body.trim() || busy) return;
    setBusy(true); setError("");
    const { data, error: sendError } = await supabase.from("chat_messages").insert({ conversation_id: selectedId, sender_id: adminId, sender_type: "admin", body: body.trim(), is_internal: internal }).select("*").single();
    if (sendError) setError("Message could not be sent.");
    else { setBody(""); setMessages((current) => current.some((item) => item.id === data.id) ? current : [...current, data as Message]); }
    setBusy(false);
  }

  async function updateConversation(changes: Partial<Pick<Conversation, "status" | "assigned_admin_id">>) {
    if (!canReply || !selectedId) return;
    setError("");
    const { data, error: updateError } = await supabase.from("chat_conversations").update({ ...changes, updated_at: new Date().toISOString() }).eq("id", selectedId).select("*").single();
    if (updateError) setError("Conversation could not be updated.");
    else setConversations((current) => current.map((item) => item.id === selectedId ? { ...item, ...data } : item));
  }

  return (
    <div className="grid min-h-[720px] overflow-hidden rounded-[28px] border border-white/10 bg-black/40 xl:grid-cols-[360px_1fr]">
      <aside className="border-b border-white/10 p-4 xl:border-b-0 xl:border-r">
        <div className="flex items-center justify-between"><h2 className="font-black">Conversations</h2><span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300">{conversations.filter((item) => item.status !== "closed").length} active</span></div>
        <div className="mt-4 max-h-[640px] space-y-2 overflow-y-auto">
          {conversations.map((conversation) => <button key={conversation.id} type="button" onClick={() => setSelectedId(conversation.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedId === conversation.id ? "border-yellow-400/40 bg-yellow-400/10" : "border-white/10 bg-white/[0.03]"}`}><div className="flex justify-between gap-2"><p className="font-bold">{conversation.memberName}</p><div className="flex items-center gap-2">{Boolean(unreadCounts.get(conversation.id)) && <span className="rounded-full bg-red-400 px-2 py-0.5 text-[10px] font-black text-black">{unreadCounts.get(conversation.id)} new</span>}<span className={`text-[10px] font-black uppercase ${conversation.status === "open" ? "text-emerald-300" : conversation.status === "closed" ? "text-zinc-600" : "text-yellow-300"}`}>{conversation.status.replace("_", " ")}</span></div></div><p className="mt-1 text-xs text-zinc-600">{conversation.memberPhone}</p><p className="mt-2 truncate text-sm text-zinc-400">{conversation.subject}</p></button>)}
        </div>
      </aside>
      <section className="flex min-h-[620px] flex-col">
        {selected ? <><div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5"><div><h3 className="font-black">{selected.subject}</h3><p className="mt-1 text-xs text-zinc-500">{selected.memberName} · {selected.memberPhone}</p></div><div className="flex flex-wrap gap-2"><select disabled={!canReply} value={selected.assigned_admin_id ?? ""} onChange={(event) => void updateConversation({ assigned_admin_id: event.target.value || null })} className="h-10 rounded-xl border border-white/10 bg-black px-3 text-xs"><option value="">Unassigned</option>{staff.map((person) => <option key={person.id} value={person.id}>{person.fullName}</option>)}</select><select disabled={!canReply} value={selected.status} onChange={(event) => void updateConversation({ status: event.target.value as Conversation["status"] })} className="h-10 rounded-xl border border-white/10 bg-black px-3 text-xs"><option value="open">Open</option><option value="in_progress">In progress</option><option value="closed">Closed</option></select></div></div><div className="flex-1 space-y-3 overflow-y-auto p-5 sm:p-7">{visibleMessages.map((message) => <div key={message.id} className={`flex ${message.sender_type === "member" ? "justify-start" : "justify-end"}`}><div className={`max-w-[82%] rounded-2xl border px-4 py-3 ${message.is_internal ? "border-purple-400/30 bg-purple-400/10" : message.sender_type === "member" ? "border-white/10 bg-white/[0.06]" : "border-yellow-400/20 bg-yellow-400/10"}`}><p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p><p className="mt-1 text-[10px] text-zinc-600">{message.is_internal ? "Internal note" : message.sender_type === "member" ? selected.memberName : message.sender_id === adminId ? "You" : "Support staff"}</p></div></div>)}</div>{canReply && <form onSubmit={send} className="border-t border-white/10 p-4 sm:p-5"><div className="flex gap-3"><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} required placeholder={internal ? "Write an internal note…" : "Reply to member…"} className="min-h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-black/60 px-4 py-3 outline-none focus:border-yellow-400/40" /><button disabled={busy} className="rounded-2xl bg-yellow-400 px-6 font-black text-black">Send</button></div><label className="mt-3 flex items-center gap-2 text-xs text-zinc-500"><input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} /> Internal note — hidden from member</label>{error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}</form>}</> : <div className="flex h-full items-center justify-center text-zinc-500">Select a conversation.</div>}
      </section>
    </div>
  );
}
