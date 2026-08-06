"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { ChatAttachmentImage } from "@/app/components/chat/ChatAttachmentImage";
import { createClient } from "@/lib/supabase/client";

import { markMemberConversationRead, uploadMemberChatImage } from "./actions";

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
  attachment_path: string | null;
  attachment_mime_type: string | null;
  created_at: string;
};

type MemberChatProps = {
  memberId: string;
  initialConversation: Conversation | null;
  initialMessages: Message[];
};

const malaysiaMessageTime = new Intl.DateTimeFormat("en-MY", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Kuala_Lumpur",
});

export function MemberChat({ memberId, initialConversation, initialMessages }: MemberChatProps) {
  const [conversation, setConversation] = useState(initialConversation);
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const messageListRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);
  const conversationId = conversation?.id ?? "";
  const visibleMessages = messages.filter((message) => !message.is_internal);

  useEffect(() => {
    const channel = supabase
      .channel(`member-support-${memberId}-${conversationId || "new"}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const message = payload.new as Message;
        if (message.conversation_id !== conversationId) return;
        setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_conversations", filter: `member_id=eq.${memberId}` }, (payload) => {
        const updated = payload.new as Conversation;
        if (updated.id === conversationId) setConversation((current) => current ? { ...current, ...updated } : updated);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, memberId, supabase]);

  useEffect(() => {
    if (!conversationId) return;
    void markMemberConversationRead(conversationId);
  }, [conversationId, messages.length]);

  useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [visibleMessages.length]);

  function clearPhoto() {
    setPhoto(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if ((!body.trim() && !photo) || busy) return;

    setBusy(true);
    setError("");
    let targetConversationId = conversationId;

    if (photo) {
      const formData = new FormData();
      formData.set("conversationId", targetConversationId);
      formData.set("body", body);
      formData.set("photo", photo);
      const result = await uploadMemberChatImage(formData);

      if (!result.ok) {
        setError(result.error);
      } else {
        setConversation(result.conversation as Conversation);
        setMessages((current) => current.some((item) => item.id === result.message.id) ? current : [...current, result.message as Message]);
        setBody("");
        clearPhoto();
      }
      setBusy(false);
      return;
    }

    if (!targetConversationId) {
      const { data: createdConversation, error: conversationError } = await supabase
        .from("chat_conversations")
        .insert({ member_id: memberId, subject: "Live Chat", status: "open" })
        .select("id, subject, status, last_message_at, member_last_read_at")
        .single();

      if (conversationError || !createdConversation) {
        setError("Unable to start Live Chat. Please try again.");
        setBusy(false);
        return;
      }

      targetConversationId = createdConversation.id;
      setConversation(createdConversation as Conversation);
    }

    const { data: message, error: sendError } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: targetConversationId,
        sender_id: memberId,
        sender_type: "member",
        body: body.trim(),
        is_internal: false,
      })
      .select("*")
      .single();

    if (sendError) {
      setError("Unable to send your message. Please try again.");
    } else {
      setBody("");
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message as Message]);
    }

    setBusy(false);
  }

  return (
    <div className="flex min-h-[560px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-black/40 lg:min-h-[650px]">
      <header className="flex min-h-20 items-center gap-3 border-b border-white/10 px-5 sm:px-7">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-600 font-black text-black">7</span>
        <span className="min-w-0">
          <strong className="block truncate">7ERA Support</strong>
          <small className="block text-zinc-500">
            {conversation ? conversation.status.replace("_", " ") : "Online support"}
          </small>
        </span>
      </header>

      <div ref={messageListRef} className="flex-1 space-y-3 overflow-y-auto p-5 sm:p-7" aria-live="polite">
        {visibleMessages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-400/20 bg-yellow-400/10 text-2xl text-yellow-300">7</span>
            <strong className="mt-5 text-lg">Chat with 7ERA Support</strong>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">Send us a message and our support team will reply here.</p>
          </div>
        )}

        {visibleMessages.map((message) => (
          <div key={message.id} className={`flex ${message.sender_type === "member" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${message.sender_type === "member" ? "bg-yellow-400 text-black" : "border border-white/10 bg-white/[0.06] text-white"}`}>
              {message.attachment_path && <ChatAttachmentImage messageId={message.id} />}
              {message.body && <p className={`${message.attachment_path ? "mt-2" : ""} whitespace-pre-wrap text-sm leading-6`}>{message.body}</p>}
              <p className={`mt-1 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[10px] ${message.sender_type === "member" ? "text-black/50" : "text-zinc-600"}`}>
                <span>{message.sender_type === "member" ? "You" : "7ERA Support"}</span>
                <time dateTime={message.created_at}>{malaysiaMessageTime.format(new Date(message.created_at))}</time>
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="border-t border-white/10 p-3 sm:p-5">
        {photo && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-100">
            <span className="truncate">Photo: {photo.name}</span>
            <button type="button" onClick={clearPhoto} className="shrink-0 font-black text-yellow-300">Remove</button>
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
                  clearPhoto();
                  return;
                }
                setError("");
                setPhoto(selectedPhoto);
              }}
            />
          </label>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={4000}
            placeholder={photo ? "Add a message (optional)…" : "Type your message…"}
            aria-label="Message"
            className="min-h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-black/60 px-4 py-3 outline-none focus:border-yellow-400/40"
          />
          <button disabled={busy || (!body.trim() && !photo)} className="rounded-2xl bg-yellow-400 px-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-50 sm:px-6">
            {busy ? "Sending…" : "Send"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-zinc-600">JPG, PNG, WebP or GIF · maximum 4MB</p>
        {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
      </form>
    </div>
  );
}
