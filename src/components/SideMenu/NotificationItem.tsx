'use client';

import Link from 'next/link';
import { type Notification } from './SideMenu';
import Image from 'next/image';
import { updateIsRead } from '@/app/actions';
import { FaUser, FaCommentDots } from 'react-icons/fa';
import React from 'react';

interface NotificationItemProps {
    notification: Notification;
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    setCountUnread: React.Dispatch<React.SetStateAction<number>>;
}

const NotificationItem = ({ notification, setNotifications, setCountUnread }: NotificationItemProps) => {

    let actionIcon = <FaUser className="text-blue-600" />;
    let actionText = "assigned you to";

    if (notification.action_type === 'CHAT_MENTION') {
        actionIcon = <FaCommentDots className="text-green-600" />;
        // チャットメッセージがあればそれを表示、なければ "mentioned you"
        if (notification.chat_message) {
            // 長すぎる場合は省略
            const content = notification.chat_message.length > 40
                ? notification.chat_message.substring(0, 40) + '...'
                : notification.chat_message;
            actionText = `: ${content}`;
        } else {
            actionText = "mentioned you";
        }
    }

    const formattedDate = new Date(notification.created_at).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    const senderName = notification.users?.name || 'Someone';
    const senderIcon = notification.users?.icon || '/default_icon.svg';
    const taskTitle = notification.tasks?.title || 'a task';
    const taskLink = `/detail/${notification.tasks?.id || ''}?returnPath=/`;

    // 3. クリックハンドラを作成
    const handleClick = async () => {
        // リンク遷移（<Link>）はそのまま実行させる

        // 4. まだ未読の場合のみ、更新処理を実行
        if (!notification.is_read) {

            // 5. 楽観的更新：クライアントのstateを即座に変更
            setNotifications(currentList =>
                currentList.map(n =>
                    n.id === notification.id ? { ...n, is_read: true } : n
                )
            );
            setCountUnread(prevCount => Math.max(0, prevCount - 1));

            // 6. バックグラウンドでServer Actionを呼び出し、DBを更新
            try {
                await updateIsRead(notification.id);
            } catch (error) {
                console.error("Failed to update notification status:", error);
                // TODO: エラー発生時にUIを元に戻す処理
            }
        }
    };

    return (
        <Link
            href={taskLink}
            prefetch={true}
        >
            <div
                onClick={handleClick} // 7. 新しいハンドラを onClick に設定
                key={notification.id}
                className={`p-4 border-b cursor-pointer transition-colors ${notification.is_read
                    ? "bg-white hover:bg-gray-50"
                    : "bg-orange-50 hover:bg-orange-100"
                    }`}
            >
                <div className="flex items-start gap-3">

                    <Image
                        src={senderIcon}
                        width={32}
                        height={32}
                        alt={`${senderName} avatar`}
                        className="rounded-full w-8 h-8 object-cover mt-1"
                    />

                    <div className="flex-1">
                        <p className="text-sm text-gray-800">
                            <span className="font-semibold">{senderName}</span>
                            {` ${actionText} `}
                            <span className="font-semibold text-cyan-700">{taskTitle}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {formattedDate}
                        </p>
                    </div>

                    <div className={`p-2 rounded-full ${notification.action_type === 'CHAT_MENTION' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {actionIcon}
                    </div>
                </div>
            </div>
        </Link>
    )
}
export default NotificationItem;

