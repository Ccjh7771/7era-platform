"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type ConversationReadState = {
  id: string;
  admin_last_read_at: string | null;
};

type MemberMessage = {
  id: string;
  conversation_id: string;
  created_at: string;
};

type AdminUnreadProviderProps = {
  children: ReactNode;
  initialConversations: ConversationReadState[];
  initialMemberMessages: MemberMessage[];
};

const AdminUnreadContext = createContext(0);

export function AdminUnreadProvider({ children, initialConversations, initialMemberMessages }: AdminUnreadProviderProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [memberMessages, setMemberMessages] = useState(initialMemberMessages);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-global-live-chat-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: "sender_type=eq.member" }, (payload) => {
        const message = payload.new as MemberMessage;
        setMemberMessages((current) => current.some((item) => item.id === message.id) ? current : [message, ...current].slice(0, 5000));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_conversations" }, (payload) => {
        const conversation = payload.new as ConversationReadState;
        setConversations((current) => current.some((item) => item.id === conversation.id) ? current : [conversation, ...current]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_conversations" }, (payload) => {
        const conversation = payload.new as ConversationReadState;
        setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, ...conversation } : item));
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const unreadConversationCount = useMemo(() => {
    const conversationsById = new Map(conversations.map((conversation) => [conversation.id, conversation]));
    const unreadIds = new Set<string>();
    for (const message of memberMessages) {
      const conversation = conversationsById.get(message.conversation_id);
      if (!conversation) continue;
      if (!conversation.admin_last_read_at || Date.parse(message.created_at) > Date.parse(conversation.admin_last_read_at)) {
        unreadIds.add(message.conversation_id);
      }
    }
    return unreadIds.size;
  }, [conversations, memberMessages]);

  return <AdminUnreadContext.Provider value={unreadConversationCount}>{children}</AdminUnreadContext.Provider>;
}

export function AdminLiveChatBadge() {
  const count = useContext(AdminUnreadContext);
  if (count === 0) return null;

  return (
    <span className="flex min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1.5 py-0.5 text-[10px] font-black leading-none text-black" aria-label={`${count} unread live chat conversations`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
