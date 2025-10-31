'use client';

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";
import { sendChatMessage } from "@/app/actions"; // Server Action (ステップ2で作成)
import { useProfile } from "@/contexts/ProfileContext";
import Image from "next/image";

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

const Chat = ({ taskId, initialMessages }: ChatProps) => {
  const supabase = createClient();
  const { profile } = useProfile(); // 自分のプロフィール情報をContextから取得

  const [messages, setMessages] = useState(initialMessages);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
    const form = event.currentTarget;
    const input = form.elements.namedItem('message') as HTMLInputElement;
    const messageText = input.value.trim();

    if (!messageText) return;

    // フォームのデータを準備
    const formData = new FormData();
    formData.append('taskId', taskId.toString());
    formData.append('message', messageText);
    
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
    
    input.value = ""; // 入力欄をクリア

    // Server Actionを呼び出してデータベースに保存
    try {
      await sendChatMessage(formData);
    } catch (error) {
      console.error("Error sending message:", error);
      // TODO: エラー時のUIロールバック
    }
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
              <p className={`break-words ext-gray-700 bg-gray-100 p-3 rounded-lg ${isMe ? "ml-18" : "mr-18"}`}>{msg.message}</p>
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
      <form onSubmit={handleFormSubmit}>
        <div className="flex gap-2">
          <input
            type="text"
            name="message"
            required
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-cyan-700 text-white font-semibold rounded-md shadow-sm hover:bg-cyan-600 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
