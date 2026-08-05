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

type MemberChatProps = {
  memberId: string;
  initialConversations: Conversation[];
  initialMessages: Message[];
  initialSelectedId?: string;
};

const malaysiaTime = new Intl.DateTimeFormat("en-MY", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Kuala_Lumpur",
});

export function MemberChat({ memberId, initialConversations, initialMessages, initialSelectedId }: MemberChatProps) {
  const validInitialId = initialConversations.some((conversation) => conversation.id === initialSelectedId)
    ? initialSelectedId ?? ""
    : "";
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState(validInitialId);
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
        setConversations((current) => current
          .map((item) => item.id === updated.id ? { ...item, ...updated } : item)
          .sort((a, b) => Date.parse(b.last_message_at) - Date.parse(a.last_message_at)));
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
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

  const latestMessages = useMemo(() => {
    const latest = new Map<string, Message>();
    for (const message of messages) {
      if (!message.is_internal) latest.set(message.conversation_id, message);
    }
    return latest;
  }, [messages]);

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId);
  const visibleMessages = messages.filter((message) => message.conversation_id === selectedId && !message.is_internal);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!selectedId || !body.trim() || busy) return;
    setBusy(true);
    setError("");
    const { data, error: sendError } = await supabase
      .from("chat_messages")
      .insert({ conversation_id: selectedId, sender_id: memberId, sender_type: "member", body: body.trim(), is_internal: false })
      .select("*")
      .single();
    if (sendError) setError("Unable to send your message.");
    else {
      setBody("");
      setMessages((current) => current.some((item) => item.id === data.id) ? current : [...current, data as Message]);
    }
    setBusy(false);
  }

  async function startConversation(event: FormEvent) {
    event.preventDefault();
    if (!newSubject.trim() || !newMessage.trim() || busy) return;
    setBusy(true);
    setError("");
    const { data: conversation, error: conversationError } = await supabase
      .from("chat_conversations")
      .insert({ member_id: memberId, subject: newSubject.trim(), status: "open" })
      .select("id, subject, status, last_message_at")
      .single();
    if (conversationError || !conversation) {
      setError("Unable to start a conversation.");
      setBusy(false);
      return;
    }
    const { data: message, error: messageError } = await supabase
      .from("chat_messages")
      .insert({ conversation_id: conversation.id, sender_id: memberId, sender_type: "member", body: newMessage.trim(), is_internal: false })
      .select("*")
      .single();
    if (messageError) setError("Conversation created, but the first message could not be sent.");
    setConversations((current) => [{ ...(conversation as Conversation), member_last_read_at: new Date().toISOString() }, ...current]);
    if (message) setMessages((current) => [...current, message as Message]);
    setSelectedId(conversation.id);
    setNewSubject("");
    setNewMessage("");
    setBusy(false);
  }

  return (
    <div className="grid min-h-[560px] overflow-hidden rounded-[28px] border border-white/10 bg-black/40 lg:min-h-[650px] lg:grid-cols-[340px_1fr]">
      <aside className={`${selectedId ? "hidden lg:block" : "block"} border-white/10 p-4 lg:border-r lg:p-5`}>
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="text-lg font-black">Your conversations</h2>
          <span className="text-xs text-zinc-600">{conversations.length}</span>
        </div>

        <div className="mt-4 divide-y divide-white/10">
          {conversations.length === 0 && <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-zinc-500">No conversations yet.</p>}
          {conversations.map((conversation) => {
            const latestMessage = latestMessages.get(conversation.id);
            const unread = unreadCounts.get(conversation.id) ?? 0;
            return (
              <button key={conversation.id} type="button" onClick={() => setSelectedId(conversation.id)} className={`flex w-full items-center gap-3 px-2 py-4 text-left transition lg:rounded-2xl lg:px-3 ${selectedId === conversation.id ? "lg:bg-yellow-400/10" : "hover:bg-white/[0.04]"}`}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 font-black text-black">7</span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-[15px]">{conversation.subject}</strong>
                  <span className="mt-1 block truncate text-sm text-zinc-500">{latestMessage ? `${latestMessage.sender_type === "member" ? "You: " : ""}${latestMessage.body}` : conversation.status.replace("_", " ")}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-2">
                  <time className={`text-[11px] ${unread ? "text-emerald-300" : "text-zinc-600"}`}>{malaysiaTime.format(new Date(conversation.last_message_at))}</time>
                  {unread > 0 && <span className="flex min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1.5 py-0.5 text-[10px] font-black leading-none text-black">{unread > 99 ? "99+" : unread}</span>}
                </span>
              </button>
            );
          })}
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

      <section className={`${selectedId ? "flex" : "hidden lg:flex"} min-h-[560px] flex-col`}>
        <header className="flex min-h-16 items-center gap-3 border-b border-white/10 px-4 sm:px-5">
          <button type="button" onClick={() => setSelectedId("")} className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-zinc-300 hover:bg-white/10 lg:hidden" aria-label="Back to conversation list">
            ‹
          </button>
          {selectedConversation ? (
            <>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 font-black text-black">7</span>
              <span className="min-w-0">
                <strong className="block truncate">{selectedConversation.subject}</strong>
                <small className="block capitalize text-zinc-500">{selectedConversation.status.replace("_", " ")}</small>
              </span>
            </>
          ) : <p className="text-sm text-zinc-500">Select a conversation</p>}
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-5 sm:p-7">
          {!selectedId && <div className="flex h-full items-center justify-center text-sm text-zinc-500">Select a conversation to contact support.</div>}
          {selectedId && visibleMessages.length === 0 && <div className="flex h-full items-center justify-center text-sm text-zinc-500">No messages yet.</div>}
          {visibleMessages.map((message) => (
            <div key={message.id} className={`flex ${message.sender_type === "member" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${message.sender_type === "member" ? "bg-yellow-400 text-black" : "border border-white/10 bg-white/[0.06] text-white"}`}>
                <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                <p className={`mt-1 text-[10px] ${message.sender_type === "member" ? "text-black/50" : "text-zinc-600"}`}>{message.sender_type === "member" ? "You" : "7ERA Support"}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedId && (
          <form onSubmit={sendMessage} className="border-t border-white/10 p-3 sm:p-5">
            <div className="flex gap-2 sm:gap-3">
              <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} required placeholder="Type your message…" className="min-h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-black/60 px-4 py-3 outline-none focus:border-yellow-400/40" />
              <button disabled={busy} className="rounded-2xl bg-yellow-400 px-4 font-black text-black sm:px-6">Send</button>
            </div>
            {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
          </form>
        )}
      </section>
    </div>
  );
}
