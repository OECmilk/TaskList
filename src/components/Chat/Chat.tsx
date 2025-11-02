'use client';

import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState, useRef, KeyboardEvent } from "react";
import { sendChatMessage } from "@/app/actions"; // Server Action (ステップ2で作成)
import { useProfile } from "@/contexts/ProfileContext";
import Image from "next/image";
import { MdSend } from "react-icons/md";

// chatsテーブルの型（初期データ用）
export type ChatMessage = {
  id: number;
  created_at: string;
  message: string;
  task_id: number;
  user_id: string;
  users: { // usersテーブルからの結合データ
    name: string | null;
    icon: string | null;
  } | null;
};

interface ChatProps {
  taskId: number;
  initialMessages: ChatMessage[]; // サーバーから渡される初期メッセージ（過去のメッセージ）
}

const mentionRegex = /@([^@\s]+)/g;
const highlightMentions = (text: string) => {
  const parts = [];
  let lastIndex = 0;
  let match;

  // 正規表現に一致するすべてのメンションをループ処理
  while ((match = mentionRegex.exec(text)) !== null) {
    // マッチする前のテキスト部分
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // マッチしたメンション部分 (紫色でハイライト)
    parts.push(
      <span key={match.index} className="text-purple-800 font-semibold text-sm">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  // 最後のマッチの後の残りテキスト
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // Reactが配列を正しくレンダリングできるように、各部分にkeyを持たせる
  return parts.map((part, index) => (
    <React.Fragment key={index}>{part}</React.Fragment>
  ));
};

const Chat = ({ taskId, initialMessages }: ChatProps) => {
  const supabase = createClient();
  const { profile } = useProfile(); // 自分のプロフィール情報をContextから取得

  const [messages, setMessages] = useState(initialMessages);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // フォームとテキストエリアへの参照
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // メッセージリストの末尾へ自動スクロール
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Supabaseのリアルタイム購読を設定
  useEffect(() => {
    // chatsテーブルのINSERTイベントを監視
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
          // 新しいメッセージが届いたら、リアルタイムでUIに反映
          // ただし、自分で送信したメッセージは二重に追加しないようにする
          if (payload.new.user_id === profile?.id) {
            return;
          }
            // 新しいメッセージの送信者のプロフィールを取得
          const { data: userData, error } = await supabase
            .from('users')
            .select('name, icon')
            .eq('id', payload.new.user_id)
            .single();

          if (error) {
            console.error('Error fetching profile for realtime message:', error);
            // ユーザー情報がなくても、メッセージ自体は表示する (フォールバック)
            setMessages((currentMessages) => [
              ...currentMessages,
              { ...payload.new, users: null } 
            ]);
          } else {
            // メッセージとプロフィールを結合してstateを更新
            const completeMessage: ChatMessage = {
              ...payload.new,
              users: userData // 取得したユーザー情報をネスト
            };
            setMessages((currentMessages) => [...currentMessages, completeMessage]);
          }
        }
      )
      .subscribe();

    // クリーンアップ
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, taskId, profile?.id]);

  // メッセージ送信フォームの処理
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const messageText = formData.get('message') as string;

    if (!messageText.trim()) return; // 空白のみのメッセージは送信しない
    
    // UIを即座に更新（楽観的更新）
    // (profileがnullでないことを前提とする)
    if (profile) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Math.random(),
          created_at: new Date().toISOString(),
          message: messageText,
          task_id: taskId, // task_idも追加
          user_id: profile.id, // profile.id を使用
          users: {
            name: profile.name,
            icon: profile.icon
          }
        }
      ]);
    }
    
    // フォームをリセット
    event.currentTarget.reset();

    // Server Actionを呼び出してデータベースに保存
    try {
      await sendChatMessage(formData);
    } catch (error) {
      console.error("Error sending message:", error);
      // TODO: エラー時のUIロールバック
    }
  };

  // Ctrl+Enter / Cmd+Enter で送信するキーボードハンドラ
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter または Cmd+Enter が押された場合
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault(); // 改行を防ぐ
      formRef.current?.requestSubmit(); // フォームを送信
    }
    // Enterキーだけが押された場合は、<textarea>のデフォルトの動作（改行）が実行される
  };


  return (
    <div className="mt-4 bg-gray-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Chat</h2>
      
      {/* メッセージ表示エリア */}
      <div ref={chatContainerRef} className="h-100 overflow-y-auto space-y-4 mb-4 p-4 bg-white border rounded-md">
        {messages.map((msg) => {
            const isMe = msg.user_id === profile?.id;
            
        return (
          <div key={msg.id} className="flex items-start gap-3">
            {/* 他人のメッセージには左側にアイコン表示 */}
            {!isMe && (
            <Image
              src={msg.users?.icon || "/default_icon.svg"}
              alt={msg.users?.name || "avatar"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />)}
            
            <div className="flex-1 max-w-[90%]">
              <p 
              className={`text-sm font-semibold ${isMe ? "text-right" : "text-left"}`}
              >
                {msg.users?.name || 'User'}
              </p>

              <div className="relative">
                {/* 他人のメッセージの場合、左側に尻尾を追加 */}
                {!isMe && (
                  <div className="absolute left-[-8px] top-2 w-0 h-0 
                    border-t-[1px] border-t-transparent
                    border-r-[10px] border-r-gray-200
                    border-b-[8px] border-b-transparent"
                  />
                )}
                
                {/* メッセージバブル本体 */}
                <p className={`p-3 rounded-lg break-words whitespace-pre-wrap text-gray-800 ${isMe ? 'bg-blue-100 ml-10' : 'bg-gray-200 mr-10'}`}>
                  {highlightMentions(msg.message)}
                </p>

                {/* 自分のメッセージの場合、右側に尻尾を追加 */}
                {isMe && (
                  <div className="absolute right-[-8px] top-2 w-0 h-0 
                    border-t-[1px] border-t-transparent
                    border-l-[10px] border-l-blue-100
                    border-b-[8px] border-b-transparent"
                  />
                )}
              </div>

              <p className={`text-xs text-gray-400 mt-1 ${isMe ? "text-right" : "text-left"}`}>
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </div>
            {/* 自分のメッセージには右側にアイコン表示 */}
            {isMe && (
            <Image
              src={msg.users?.icon || "/default_icon.svg"}
              alt={msg.users?.name || "avatar"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
            )}
          </div>
        )})}
      </div>

      {/* メッセージ送信フォーム */}
      <form ref={formRef} onSubmit={handleFormSubmit}>
        <input type="hidden" name="taskId" value={taskId} />
        <div className="flex gap-2">
          <textarea
            name="message"
            ref={textareaRef}
            onKeyDown={handleKeyDown}
            required
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-cyan-700 text-white font-semibold rounded-md shadow-sm hover:bg-cyan-600 transition-colors"
          >
            <MdSend className="mx-auto size-5" />
            <div className="mt-2 text-[10px] text-cyan-100 font-normal block">(Ctrl+Enter)</div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
