'use client';

import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState, useRef, KeyboardEvent } from "react";
import { sendChatMessage } from "@/app/actions";
import { useProfile } from "@/contexts/ProfileContext";
import Image from "next/image";
import { MdSend } from "react-icons/md";

export type ChatMessage = {
  id: number;
  created_at: string;
  message: string;
  task_id: number;
  user_id: string;
  users: {
    name: string | null;
    icon: string | null;
  } | null;
};

interface ProjectMember {
  user_id: string;
  users: {
    id: string;
    name: string;
    icon: string | null;
  };
}

interface ChatProps {
  taskId: number;
  initialMessages: ChatMessage[];
  projectMembers?: ProjectMember[];
}

const mentionRegex = /@([^@\s]+)/g;
const highlightMentions = (text: string) => {
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} className="font-bold px-1 rounded mx-0.5 text-sm" style={{ color: 'var(--color-accent)', background: 'var(--color-accent-alpha)' }}>
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.map((part, index) => (
    <React.Fragment key={index}>{part}</React.Fragment>
  ));
};

const Chat = ({ taskId, initialMessages, projectMembers = [] }: ChatProps) => {
  // Supabaseクライアントをメモ化して再レンダリングごとの再生成を防ぐ
  const supabase = React.useMemo(() => createClient(), []);
  const { profile } = useProfile();

  // Logic State
  const [messages, setMessages] = useState(initialMessages);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState<number | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Realtime Subscription
  useEffect(() => {
    console.log(`Setting up subscription for task ${taskId}`);
    const channel = supabase
      .channel(`chat_room_for_task_${taskId}`)
      .on<ChatMessage>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `task_id=eq.${taskId}`
        },
        async (payload) => {
          console.log('New chat message received!', payload);
          if (payload.new.user_id === profile?.id) return;

          const { data: userData, error } = await supabase
            .from('users')
            .select('name, icon')
            .eq('id', payload.new.user_id)
            .single();

          if (error) {
            setMessages((currentMessages) => [
              ...currentMessages,
              { ...payload.new, users: null }
            ]);
          } else {
            const completeMessage: ChatMessage = {
              ...payload.new,
              users: userData
            };
            setMessages((currentMessages) => [...currentMessages, completeMessage]);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for task ${taskId}:`, status);
      });

    return () => {
      console.log(`Cleaning up subscription for task ${taskId}`);
      supabase.removeChannel(channel);
    };
  }, [supabase, taskId, profile?.id]);

  // Submit Logic
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const messageText = formData.get('message') as string;

    if (!messageText.trim()) return;

    if (profile) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Math.random(),
          created_at: new Date().toISOString(),
          message: messageText,
          task_id: taskId,
          user_id: profile.id,
          users: {
            name: profile.name,
            icon: profile.icon
          }
        }
      ]);
    }

    event.currentTarget.reset();
    setMentionQuery(null);

    try {
      await sendChatMessage(formData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Key Down Handler
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  // Mention Detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const selectionEnd = e.target.selectionEnd;
    const lastAt = text.lastIndexOf('@', selectionEnd - 1);

    if (lastAt !== -1) {
      const charBeforeAt = lastAt > 0 ? text[lastAt - 1] : ' ';
      const query = text.slice(lastAt + 1, selectionEnd);

      if ((charBeforeAt === ' ' || charBeforeAt === '\n') && !query.includes('\n')) {
        setMentionQuery(query);
        setMentionIndex(lastAt);
        return;
      }
    }

    setMentionQuery(null);
    setMentionIndex(null);
  };

  const handleMentionSelect = (user: { id: string, name: string }) => {
    if (textareaRef.current && mentionIndex !== null) {
      const text = textareaRef.current.value;
      const before = text.substring(0, mentionIndex);
      const after = text.substring(textareaRef.current.selectionEnd);
      const newText = `${before}@${user.name} ${after}`;

      textareaRef.current.value = newText;
      setMentionQuery(null);
      setMentionIndex(null);
      textareaRef.current.focus();
    }
  };

  const filteredMembers = mentionQuery !== null
    ? (projectMembers || []).filter(m => m.users.name.toLowerCase().includes(mentionQuery.toLowerCase()))
    : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Chat</h2>
        <span className="px-2 py-0.5 text-xs rounded-full font-medium" style={{ background: 'var(--color-accent-alpha)', color: 'var(--color-text-secondary)' }}>{messages.length}</span>
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-6 px-3 py-5 rounded-2xl shadow-inner"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {messages.map((msg) => {
          const isMe = msg.user_id === profile?.id;

          return (
            <div key={msg.id} className={`flex items-end gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className="flex-shrink-0 relative">
                <Image
                  src={msg.users?.icon || "/default_icon.svg"}
                  alt={msg.users?.name || "avatar"}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
              </div>

              <div className={`flex flex-col max-w-[85%] ${isMe ? "items-end" : "items-start"}`}>
                {/* Name (Only for others) */}
                {!isMe && (
                  <span className="text-xs text-gray-500 ml-1 mb-1 font-medium">
                    {msg.users?.name || 'User'}
                  </span>
                )}

                {/* Message Bubble */}
                <div
                  className={`
                    relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${isMe
                      ? 'rounded-br-none'
                      : 'rounded-bl-none'
                    }
                `}
                  style={isMe
                    ? { background: 'rgb(250, 240, 230)', color: '#374151' }
                    : { background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }
                  }
                >
                  <p className="break-words whitespace-pre-wrap">
                    {highlightMentions(msg.message)}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-gray-400 mt-1.5 px-1">
                  {new Date(msg.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        })}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="pt-4 mt-auto">
        <form ref={formRef} onSubmit={handleFormSubmit} className="relative group">
          <input type="hidden" name="taskId" value={taskId} />

          {/* Mention List Dropdown */}
          {mentionQuery !== null && filteredMembers.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
              <div className="py-2">
                <p className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Members</p>
                {filteredMembers.map(member => (
                  <button
                    key={member.user_id}
                    type="button"
                    onClick={() => handleMentionSelect(member.users)}
                    className="w-full text-left px-4 py-2 flex items-center gap-3 transition-colors"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 relative flex-shrink-0">
                      <Image src={member.users.icon || '/default_icon.svg'} alt={member.users.name} fill className="object-cover" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{member.users.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative">
            <textarea
              name="message"
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              onChange={handleInputChange} // Attached handler
              required
              rows={1}
              placeholder="Type a message..."
              className="input-field w-full pl-5 pr-14 py-4 rounded-3xl resize-none leading-normal"
              style={{ minHeight: '56px', maxHeight: '120px' }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-lg transition-all active:scale-95 bg-gray-800 text-white hover:bg-gray-700"
            >
              <MdSend className="w-5 h-5 ml-0.5" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Press <span className="font-semibold text-gray-500">Ctrl + Enter</span> to send
          </p>
        </form>
      </div>
    </div>
  );
};
export default Chat;
