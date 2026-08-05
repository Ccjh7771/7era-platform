"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import { markMemberConversationRead } from "./actions";

type Conversation = {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "closed";
  last_message_at: string;
  member_last_read_at: string | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: "member" | "admin" | "system";
  body: string;
  is_internal: boolean;
  created_at: string;
};

export function MemberChat({ memberId, initialConversations, initialMessages, initialSelectedId }: { memberId: string; initialConversations: Conversation[]; initialMessages: Message[]; initialSelectedId?: string }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState(initialConversations.some((conversation) => conversation.id === initialSelectedId) ? initialSelectedId ?? "" : initialConversations[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel(`member-support-${memberId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const message = payload.new as Message;
        setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_conversations", filter: `member_id=eq.${memberId}` }, (payload) => {
        const updated = payload.new as Conversation;
        setConversations((current) => [...current.map((item) => item.id === updated.id ? { ...item, ...updated } : item)].sort((a, b) => Date.parse(b.last_message_at) - Date.parse(a.last_message_at)));
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [memberId, supabase]);

  useEffect(() => {
    if (!selectedId) return;
    void markMemberConversationRead(selectedId);
  }, [messages.length, selectedId]);

  const unreadCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const conversationsById = new Map(conversations.map((conversation) => [conversation.id, conversation]));
    for (const message of messages) {
      if (message.sender_type === "member" || message.is_internal) continue;
      const conversation = conversationsById.get(message.conversation_id);
      if (!conversation?.member_last_read_at || Date.parse(message.created_at) > Date.parse(conversation.member_last_read_at)) {
        counts.set(message.conversation_id, (counts.get(message.conversation_id) ?? 0) + 1);
      }
    }
    return counts;
  }, [conversations, messages]);

  const visibleMessages = messages.filter((message) => message.conversation_id === selectedId && !message.is_internal);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!selectedId || !body.trim() || busy) return;
    setBusy(true); setError("");
    const { data, error: sendError } = await supabase.from("chat_messages").insert({ conversation_id: selectedId, sender_id: memberId, sender_type: "member", body: body.trim(), is_internal: false }).select("*").single();
    if (sendError) setError("Unable to send your message.");
    else { setBody(""); setMessages((current) => current.some((item) => item.id === data.id) ? current : [...current, data as Message]); }
    setBusy(false);
  }

  async function startConversation(event: FormEvent) {
    event.preventDefault();
    if (!newSubject.trim() || !newMessage.trim() || busy) return;
    setBusy(true); setError("");
    const { data: conversation, error: conversationError } = await supabase.from("chat_conversations").insert({ member_id: memberId, subject: newSubject.trim(), status: "open" }).select("id, subject, status, last_message_at").single();
    if (conversationError || !conversation) { setError("Unable to start a conversation."); setBusy(false); return; }
    const { data: message, error: messageError } = await supabase.from("chat_messages").insert({ conversation_id: conversation.id, sender_id: memberId, sender_type: "member", body: newMessage.trim(), is_internal: false }).select("*").single();
    if (messageError) setError("Conversation created, but the first message could not be sent.");
    setConversations((current) => [{ ...(conversation as Conversation), member_last_read_at: new Date().toISOString() }, ...current]);
    if (message) setMessages((current) => [...current, message as Message]);
    setSelectedId(conversation.id); setNewSubject(""); setNewMessage(""); setBusy(false);
  }

  return (
    <div className="grid min-h-[650px] overflow-hidden rounded-[28px] border border-white/10 bg-black/40 lg:grid-cols-[320px_1fr]">
      <aside className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
        <h2 className="font-black">Your conversations</h2>
        <div className="mt-4 space-y-2">
          {conversations.map((conversation) => <button key={conversation.id} type="button" onClick={() => setSelectedId(conversation.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedId === conversation.id ? "border-yellow-400/40 bg-yellow-400/10" : "border-white/10 bg-white/[0.03]"}`}><div className="flex items-start justify-between gap-3"><p className="font-bold">{conversation.subject}</p>{Boolean(unreadCounts.get(conversation.id)) && <span className="shrink-0 rounded-full bg-red-400 px-2 py-0.5 text-[10px] font-black text-black">{unreadCounts.get(conversation.id)} new</span>}</div><p className="mt-1 text-xs uppercase text-zinc-500">{conversation.status.replace("_", " ")}</p></button>)}
        </div>
        <details className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4" open={conversations.length === 0}>
          <summary className="cursor-pointer font-bold text-yellow-300">Start new chat</summary>
          <form onSubmit={startConversation} className="mt-4 space-y-3">
            <input value={newSubject} onChange={(event) => setNewSubject(event.target.value)} maxLength={100} required placeholder="Subject" className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 outline-none" />
            <textarea value={newMessage} onChange={(event) => setNewMessage(event.target.value)} maxLength={4000} required placeholder="How can we help?" className="min-h-24 w-full rounded-xl border border-white/10 bg-black/50 p-3 outline-none" />
            <button disabled={busy} className="h-11 w-full rounded-xl bg-yellow-400 font-black text-black">Start chat</button>
          </form>
        </details>
      </aside>
      <section className="flex min-h-[560px] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-5 sm:p-7">
          {!selectedId && <div className="flex h-full items-center justify-center text-sm text-zinc-500">Start a conversation to contact support.</div>}
          {visibleMessages.map((message) => <div key={message.id} className={`flex ${message.sender_type === "member" ? "justify-end" : "justify-start"}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 ${message.sender_type === "member" ? "bg-yellow-400 text-black" : "border border-white/10 bg-white/[0.06] text-white"}`}><p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p><p className={`mt-1 text-[10px] ${message.sender_type === "member" ? "text-black/50" : "text-zinc-600"}`}>{message.sender_type === "member" ? "You" : "7ERA Support"}</p></div></div>)}
        </div>
        {selectedId && <form onSubmit={sendMessage} className="border-t border-white/10 p-4 sm:p-5"><div className="flex gap-3"><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} required placeholder="Type your message…" className="min-h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-black/60 px-4 py-3 outline-none focus:border-yellow-400/40" /><button disabled={busy} className="rounded-2xl bg-yellow-400 px-6 font-black text-black">Send</button></div>{error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}</form>}
      </section>
    </div>
  );
}
