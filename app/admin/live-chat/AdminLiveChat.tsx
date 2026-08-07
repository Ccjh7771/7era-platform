"use client";

import { FormEvent, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { ChatAttachmentImage } from "@/app/components/chat/ChatAttachmentImage";
import { displayMalaysianPhone } from "@/lib/member/phone";
import { createClient } from "@/lib/supabase/client";

import { markAdminConversationRead, uploadAdminChatImage } from "./actions";

type Conversation = {
  id: string;
  member_id: string;
  subject: string;
  status: "open" | "in_progress" | "closed";
  assigned_admin_id: string | null;
  last_message_at: string;
  admin_last_read_at: string | null;
  memberName: string;
  memberPhone: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: "member" | "admin" | "system";
  body: string;
  is_internal: boolean;
  attachment_path: string | null;
  attachment_mime_type: string | null;
  created_at: string;
};

type Staff = { id: string; fullName: string };
type RequestedMember = { id: string; name: string; phone: string };
type ConversationFilter = "all" | "unread" | "active" | "mine";

type AdminLiveChatProps = {
  adminId: string;
  canReply: boolean;
  initialConversations: Conversation[];
  initialMessages: Message[];
  staff: Staff[];
  requestedMember: RequestedMember | null;
};

const malaysiaTime = new Intl.DateTimeFormat("en-MY", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Kuala_Lumpur",
});

const malaysiaMessageTime = new Intl.DateTimeFormat("en-MY", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Kuala_Lumpur",
});

const conversationFilters: Array<{ id: ConversationFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "active", label: "Active" },
  { id: "mine", label: "Mine" },
];

export function AdminLiveChat({ adminId, canReply, initialConversations, initialMessages, staff, requestedMember }: AdminLiveChatProps) {
  const initialSelectedId = requestedMember ? initialConversations.find((conversation) => conversation.member_id === requestedMember.id)?.id ?? "" : "";
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(initialSelectedId ? "" : requestedMember?.phone ?? "");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const messageListRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-live-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const message = payload.new as Message;
        setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_conversations" }, async (payload) => {
        const conversation = payload.new as Omit<Conversation, "memberName" | "memberPhone">;
        const { data: member } = await supabase
          .from("member_profiles")
          .select("full_name, phone")
          .eq("id", conversation.member_id)
          .maybeSingle();
        const hydrated = {
          ...conversation,
          memberName: member?.full_name ?? "Member",
          memberPhone: member?.phone ? displayMalaysianPhone(member.phone) : "",
        };
        setConversations((current) => current.some((item) => item.id === conversation.id) ? current : [hydrated, ...current]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_conversations" }, (payload) => {
        const updated = payload.new as Conversation;
        setConversations((current) => current
          .map((item) => item.id === updated.id ? { ...item, ...updated } : item)
          .sort((a, b) => Date.parse(b.last_message_at) - Date.parse(a.last_message_at)));
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
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

  const latestMessages = useMemo(() => {
    const latest = new Map<string, Message>();
    for (const message of messages) latest.set(message.conversation_id, message);
    return latest;
  }, [messages]);

  const filteredConversations = useMemo(() => conversations.filter((conversation) => {
    const latest = latestMessages.get(conversation.id);
    const matchesSearch = deferredSearch.length === 0 || [
      conversation.memberName,
      conversation.memberPhone,
      conversation.subject,
      latest?.body ?? "",
    ].some((value) => value.toLowerCase().includes(deferredSearch));
    if (!matchesSearch) return false;
    if (filter === "unread") return (unreadCounts.get(conversation.id) ?? 0) > 0;
    if (filter === "active") return conversation.status !== "closed";
    if (filter === "mine") return conversation.assigned_admin_id === adminId;
    return true;
  }), [adminId, conversations, deferredSearch, filter, latestMessages, unreadCounts]);

  const selected = conversations.find((item) => item.id === selectedId);
  const visibleMessages = messages.filter((item) => item.conversation_id === selectedId);
  const staffNames = useMemo(() => new Map(staff.map((person) => [person.id, person.fullName])), [staff]);

  useEffect(() => {
    if (!selectedId || !messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [selectedId, visibleMessages.length]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!canReply || !selectedId || (!body.trim() && !photo) || busy) return;
    setBusy(true);
    setError("");

    if (photo) {
      const formData = new FormData();
      formData.set("conversationId", selectedId);
      formData.set("body", body);
      formData.set("internal", String(internal));
      formData.set("photo", photo);
      const result = await uploadAdminChatImage(formData);

      if (!result.ok) {
        setError(result.error);
      } else {
        setBody("");
        setPhoto(null);
        setInternal(false);
        if (photoInputRef.current) photoInputRef.current.value = "";
        setMessages((current) => current.some((item) => item.id === result.message.id) ? current : [...current, result.message as Message]);
      }
      setBusy(false);
      return;
    }

    const { data, error: sendError } = await supabase
      .from("chat_messages")
      .insert({ conversation_id: selectedId, sender_id: adminId, sender_type: "admin", body: body.trim(), is_internal: internal })
      .select("*")
      .single();
    if (sendError) {
      setError(sendError.message.includes("chat_message_rate_limit")
        ? "Messages are being sent too quickly. Please wait a moment."
        : "Message could not be sent.");
    }
    else {
      setBody("");
      setInternal(false);
      setMessages((current) => current.some((item) => item.id === data.id) ? current : [...current, data as Message]);
    }
    setBusy(false);
  }

  async function updateConversation(changes: Partial<Pick<Conversation, "status" | "assigned_admin_id">>) {
    if (!canReply || !selectedId) return;
    setError("");
    const { data, error: updateError } = await supabase
      .from("chat_conversations")
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq("id", selectedId)
      .select("*")
      .single();
    if (updateError) setError("Conversation could not be updated.");
    else setConversations((current) => current.map((item) => item.id === selectedId ? { ...item, ...data } : item));
  }

  return (
    <div className="grid min-h-[620px] overflow-hidden rounded-[28px] border border-white/10 bg-black/40 xl:min-h-[720px] xl:grid-cols-[360px_1fr]">
      <aside className={`${selectedId ? "hidden xl:block" : "block"} border-white/10 p-4 xl:border-r`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-black">Conversations</h2>
          <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300">
            {conversations.filter((item) => item.status !== "closed").length} active
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="sr-only">Search conversations</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search member, phone or message"
              className="h-11 w-full rounded-xl border border-white/10 bg-black/60 px-3 text-sm outline-none placeholder:text-zinc-700 focus:border-yellow-400/40"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Conversation filters">
            {conversationFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                aria-pressed={filter === item.id}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-black transition ${filter === item.id ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300" : "border-white/10 text-zinc-500 hover:text-zinc-300"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-600">Showing {filteredConversations.length} of {conversations.length}</p>
        </div>

        <div className="mt-4 max-h-[640px] divide-y divide-white/10 overflow-y-auto">
          {conversations.length === 0 && <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-zinc-500">No conversations yet.</p>}
          {conversations.length > 0 && filteredConversations.length === 0 && <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-zinc-500">No matching conversations.</p>}
          {filteredConversations.map((conversation) => {
            const unread = unreadCounts.get(conversation.id) ?? 0;
            const latest = latestMessages.get(conversation.id);
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedId(conversation.id)}
                className={`flex w-full items-center gap-3 px-2 py-4 text-left transition xl:rounded-2xl xl:px-3 ${selectedId === conversation.id ? "xl:bg-yellow-400/10" : "hover:bg-white/[0.04]"}`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 font-black text-black">
                  {conversation.memberName.charAt(0).toUpperCase() || "M"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <strong className="min-w-0 flex-1 truncate text-sm">{conversation.memberName}</strong>
                    <span className={`text-[9px] font-black uppercase ${conversation.status === "open" ? "text-emerald-300" : conversation.status === "closed" ? "text-zinc-600" : "text-yellow-300"}`}>
                      {conversation.status.replace("_", " ")}
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-xs text-zinc-500">
                    {latest ? `${latest.sender_type === "member" ? "Member: " : latest.is_internal ? "Note: " : "Staff: "}${latest.body || (latest.attachment_path ? "Photo" : "")}` : conversation.subject}
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-zinc-700">{conversation.memberPhone} · {conversation.subject}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-2">
                  <time dateTime={conversation.last_message_at} className={`text-[10px] ${unread ? "text-emerald-300" : "text-zinc-600"}`}>
                    {malaysiaTime.format(new Date(conversation.last_message_at))}
                  </time>
                  {unread > 0 && <span className="flex min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1.5 py-0.5 text-[10px] font-black leading-none text-black">{unread > 99 ? "99+" : unread}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className={`${selectedId ? "flex" : "hidden xl:flex"} min-h-[620px] flex-col`}>
        {selected ? (
          <>
            <header className="border-b border-white/10 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <button type="button" onClick={() => setSelectedId("")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl text-zinc-300 hover:bg-white/10 xl:hidden" aria-label="Back to conversation list">
                  ‹
                </button>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-black">{selected.subject}</h3>
                  <p className="mt-1 truncate text-xs text-zinc-500">{selected.memberName} · {selected.memberPhone}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                <select aria-label="Assign staff" disabled={!canReply} value={selected.assigned_admin_id ?? ""} onChange={(event) => void updateConversation({ assigned_admin_id: event.target.value || null })} className="h-10 min-w-0 rounded-xl border border-white/10 bg-black px-2 text-xs sm:px-3">
                  <option value="">Unassigned</option>
                  {staff.map((person) => <option key={person.id} value={person.id}>{person.fullName}</option>)}
                </select>
                <select aria-label="Conversation status" disabled={!canReply} value={selected.status} onChange={(event) => void updateConversation({ status: event.target.value as Conversation["status"] })} className="h-10 min-w-0 rounded-xl border border-white/10 bg-black px-2 text-xs sm:px-3">
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </header>

            <div ref={messageListRef} className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-7" aria-live="polite">
              {visibleMessages.length === 0 && <div className="flex h-full items-center justify-center text-sm text-zinc-500">No messages yet.</div>}
              {visibleMessages.map((message) => (
                <div key={message.id} className={`flex ${message.sender_type === "member" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[86%] rounded-2xl border px-4 py-3 sm:max-w-[82%] ${message.is_internal ? "border-purple-400/30 bg-purple-400/10" : message.sender_type === "member" ? "border-white/10 bg-white/[0.06]" : "border-yellow-400/20 bg-yellow-400/10"}`}>
                    {message.attachment_path && <ChatAttachmentImage messageId={message.id} />}
                    {message.body && <p className={`${message.attachment_path ? "mt-2" : ""} whitespace-pre-wrap text-sm leading-6`}>{message.body}</p>}
                    <p className="mt-1 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[10px] text-zinc-600">
                      <span>{message.is_internal ? `Internal note · ${message.sender_id === adminId ? "You" : staffNames.get(message.sender_id) ?? "Support staff"}` : message.sender_type === "member" ? selected.memberName : message.sender_id === adminId ? "You" : staffNames.get(message.sender_id) ?? "Support staff"}</span>
                      <time dateTime={message.created_at}>{malaysiaMessageTime.format(new Date(message.created_at))}</time>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {canReply && (
              <form onSubmit={send} className="border-t border-white/10 p-3 sm:p-5">
                {photo && (
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-100">
                    <span className="truncate">Photo: {photo.name}</span>
                    <button type="button" onClick={() => { setPhoto(null); if (photoInputRef.current) photoInputRef.current.value = ""; }} className="shrink-0 font-black text-yellow-300">Remove</button>
                  </div>
                )}
                <div className="flex gap-2 sm:gap-3">
                  <label className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-white/10 text-xl text-yellow-300 transition hover:border-yellow-400/40" aria-label="Upload photo">
                    <span aria-hidden="true">＋</span>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={(event) => {
                        const selectedPhoto = event.target.files?.[0] ?? null;
                        if (selectedPhoto && selectedPhoto.size > 4 * 1024 * 1024) {
                          setError("Photo must be smaller than 4MB.");
                          event.target.value = "";
                          setPhoto(null);
                          return;
                        }
                        setError("");
                        setPhoto(selectedPhoto);
                      }}
                    />
                  </label>
                  <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} placeholder={photo ? "Add a message (optional)…" : internal ? "Write an internal note…" : "Reply to member…"} aria-label="Message" className="min-h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-black/60 px-4 py-3 outline-none focus:border-yellow-400/40" />
                  <button disabled={busy || (!body.trim() && !photo)} className="rounded-2xl bg-yellow-400 px-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-50 sm:px-6">{busy ? "Sending…" : "Send"}</button>
                </div>
                <p className="mt-2 text-[11px] text-zinc-600">JPG, PNG, WebP or GIF · maximum 4MB</p>
                <label className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                  <input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} />
                  Internal note — hidden from member
                </label>
                {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
              </form>
            )}
          </>
        ) : requestedMember ? (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400/10 text-xl font-black text-yellow-300">{requestedMember.name.charAt(0).toUpperCase() || "M"}</div>
              <p className="mt-4 font-black text-white">{requestedMember.name}</p>
              <p className="mt-1 text-sm text-zinc-500">{requestedMember.phone}</p>
              <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">This member has not started a Live Chat conversation yet. Ask the member to open Live Chat and send the first message.</p>
            </div>
          </div>
        ) : <div className="flex h-full items-center justify-center text-zinc-500">Select a conversation.</div>}
      </section>
    </div>
  );
}
