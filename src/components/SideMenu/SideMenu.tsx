"use client";

import NavList from "./NavList/NavList";
import { useState, useEffect, useRef } from "react";
import { createPortal } from 'react-dom';
import { FaArrowLeft, FaBars, FaRegBell } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useProfile, Profile } from "@/contexts/ProfileContext";
import NotificationItem from "./NotificationItem";
import { usePushSubscription } from "@/hooks/usePushSubscription";

export type Notification = {
  id: number;
  created_at: string;
  action_type: 'TASK_ASSIGNED' | 'CHAT_MENTION';
  is_read: boolean;
  tasks: {
    id: number;
    title: string;
  };
  users: {
    name: string;
    icon: string | null;
  };
  chat_message?: string;
};

interface SideMenuProps {
  initialUnreadCount: number;
  initialNotifications: Notification[];
}

const SideMenu = ({ initialUnreadCount, initialNotifications }: SideMenuProps) => {

  const [isOpenBurger, setisOpenBurger] = useState(false);
  const { profile, setProfile } = useProfile();
  const [isOpenNotifications, setIsOpenNotifications] = useState(false);
  const [countUnread, setCountUnread] = useState<number>(initialUnreadCount);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const pathname = usePathname();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const { isSubscribed, subscribeToPush, unsubscribeFromPush } = usePushSubscription();



  // 元のfaviconのHREFを記憶するためのref
  const originalFaviconHref = useRef<string>('');

  // No need for useEffect to set profile here since ProfileProvider handles it now
  /* 
  useEffect(() => {
    if (initialProfile && !profile) {
      setProfile(initialProfile);
    }
  }, [initialProfile, profile, setProfile]);
  */

  // リアルタイム通知の購読
  useEffect(() => {
    if (profile?.id) {
      const channel = supabase
        .channel(`notifications_for_${profile.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `to_user_id=eq.${profile.id}`
          },
          (payload) => {
            console.log('New notification received!', payload);
            const rawNotification = payload.new;
            const fetchRelatedData = async () => {
              const [userResult, taskResult] = await Promise.all([
                supabase
                  .from('users')
                  .select('name, icon')
                  .eq('id', rawNotification.from_user_id)
                  .single(),
                supabase
                  .from('tasks')
                  .select('id, title')
                  .eq('id', rawNotification.task_id)
                  .single()
              ]);
              if (taskResult.error || !taskResult.data) {
                console.error('Error fetching related task for notification:', taskResult.error);
                return;
              }
              if (userResult.error || !userResult.data) {
                console.error('Error fetching related user for notification:', userResult.error);
                return;
              }

              let chatMessage = undefined;
              if (rawNotification.action_type === 'CHAT_MENTION') {
                const { data: chatData } = await supabase
                  .from('chats')
                  .select('message')
                  .eq('task_id', rawNotification.task_id)
                  .eq('user_id', rawNotification.from_user_id)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .single();
                if (chatData) {
                  chatMessage = chatData.message;
                }
              }

              const userName = userResult.data.name || 'Unknown User';
              const completeNotification: Notification = {
                id: rawNotification.id,
                created_at: rawNotification.created_at,
                action_type: rawNotification.action_type,
                is_read: rawNotification.is_read,
                tasks: taskResult.data,
                users: {
                  name: userName,
                  icon: userResult.data.icon
                },
                chat_message: chatMessage
              };
              setNotifications((currentNotifications) => [completeNotification, ...currentNotifications]);
              setCountUnread((prevCount) => prevCount + 1);
            };
            fetchRelatedData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `to_user_id=eq.${profile.id}`
          },
          (payload) => {
            console.log('Notification read status updated!', payload);

            // setNotifications のコールバック内で、リスト更新と件数更新を「両方」行う
            setNotifications(currentList => {

              // 2. まず、新しい通知リストを作成
              const newList = currentList.map(n =>
                n.id === payload.new.id ? { ...n, is_read: payload.new.is_read } : n
              );

              // 3. 次に、その「新しいリスト」を基に、未読件数を再計算
              const newUnreadCount = newList.filter(n => !n.is_read).length;

              // 4. 件数用のstateもここで更新
              setCountUnread(newUnreadCount);

              // 5. 最後に、新しいリストを返す
              return newList;
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [supabase, profile?.id]);

  // client mount フラグ（ポータルはマウント後のみ出力）
  useEffect(() => {
    setMounted(true);
  }, []);


  //  ファビコンに通知の有無を描画用のuseEffect
  useEffect(() => {
    //  ファビコンの<link>タグを見つける
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    // 初回実行時に、元のfaviconのパスを記憶する
    if (!originalFaviconHref.current) {
      originalFaviconHref.current = link.href;
    }

    // 未読件数が0なら、元のfaviconに戻して終了
    if (countUnread === 0) {
      link.href = originalFaviconHref.current;
      return;
    }

    // メモリ上に32x32のキャンバスを作成
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 元のファビコン（タコのアイコン）をロード
    const baseIcon = new window.Image();
    baseIcon.src = "/favicon.ico"; // publicフォルダのfavicon

    baseIcon.onload = () => {
      //  キャンバスに元のアイコンを描画
      ctx.drawImage(baseIcon, 0, 0, 32, 32);

      //  バッジ（赤い円）を描画
      const badgeRadius = 5;
      const badgeX = canvas.width - badgeRadius;
      const badgeY = badgeRadius;
      ctx.fillStyle = '#FF4136';
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
      ctx.fill();

      //  バッジの上に通知（赤色）マークを描画
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("", badgeX, badgeY + 1);

      // キャンバスから新しい画像データ(URL)を生成し、faviconに設定
      link!.href = canvas.toDataURL('image/png');
    };

  }, [countUnread]); // countUnreadが変更されるたびに実行


  const handleBellClick = () => {
    setIsOpenNotifications(true);
    // (既読処理は NotificationItem 側が担当する)
  };

  // 名前orEmail取得
  const getDisplayName = () => {
    if (!profile) return null;
    return profile.name || profile.email;
  }

  // タコのあいさつ用
  // const [helloStatus, setHelloStatus] = useState(false);
  // const sayHello = () => {
  //   setHelloStatus(true);
  // }

  return (
    <>
      <button
        className={`md:hidden fixed top-3 left-4 z-30 transition-colors ${isOpenBurger ? "opacity-0" : ""}`}
        style={{ color: 'var(--color-text-primary)' }}
        onClick={() => setisOpenBurger(!isOpenBurger)}
        aria-label="サイドメニューを開閉する"
      >
        {isOpenBurger ? <></> : <FaBars size={20} />}
      </button>

      <div className={`sidebar w-64 pt-6 fixed h-full z-50 transform transition-transform duration-300 ease-in-out pb-20 
          ${isOpenBurger ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 overflow-y-auto`}
      >
        <div className="flex flex-col h-full min-h-0">
          <div>
            {/* 通知ボタン */}
            <div className="relative">
              <FaRegBell
                onClick={handleBellClick}
                className="drawer-ignore-click size-11 ml-auto mr-4 mb-2 rounded-full p-2.5 cursor-pointer z-50 transition-colors"
                style={{ color: 'rgba(var(--theme-1), 0.7)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(var(--theme-1), 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              />
              {countUnread > 0 && (
                <div className="badge absolute top-0 right-4 border-2" style={{ borderColor: 'rgb(var(--theme-4))' }}>
                  {countUnread}
                </div>
              )}
            </div>

            {/* 通知ボード本体（ポータルで body にレンダリングして、親の transform/overflow による切り取りを回避） */}
            {
              mounted && createPortal(
                <div className={`w-64 md:w-80 fixed h-full z-50 top-0 shadow-xl transition-transform duration-300 ease-in-out
                  ${isOpenNotifications ? 'translate-x-0' : '-translate-x-full'}`}
                  style={{ background: 'var(--color-card)', color: 'var(--color-text-primary)' }}>

                  <div className="flex p-4 items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <h2 className="px-2 text-lg font-bold">通知</h2>
                      <div className="px-2 flex items-center gap-2 mt-1">
                        <div
                          className={`toggle-switch ${isSubscribed ? 'active' : ''}`}
                          onClick={() => {
                            if (isSubscribed) {
                              unsubscribeFromPush();
                            } else {
                              subscribeToPush();
                            }
                          }}
                        />
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>プッシュ通知</span>
                      </div>
                    </div>
                    <FaArrowLeft
                      onClick={() => { setIsOpenNotifications(false) }}
                      className="size-9 p-2 rounded-full cursor-pointer transition-colors"
                      style={{ color: 'var(--color-text-secondary)' }}
                    />
                  </div>

                  {/* 通知リスト */}
                  <div className="w-full overflow-y-auto h-[calc(100%-65px)]">
                    <ul>
                      {notifications && notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <li key={notification.id}>
                            <NotificationItem
                              notification={notification}
                              setNotifications={setNotifications}
                              setCountUnread={setCountUnread}
                            />
                          </li>
                        ))
                      ) : (
                        <p className="text-center p-6" style={{ color: 'var(--color-text-muted)' }}>No notifications yet.</p>
                      )}
                    </ul>
                  </div>

                </div>,
                document.body
              )
            }
          </div>

          {/* userと、Contextから取得したprofileを使ってUIを構築 */}
          {profile && (
            <div className="p-3" style={{ borderTop: '1px solid rgba(var(--theme-1), 0.1)' }}>
              <Link href="/profile" className={`sidebar-item ${pathname === '/profile' ? 'active' : ''}`}>
                <Image
                  src={profile.icon || "/default_icon.svg"}
                  width={36}
                  height={36}
                  alt="User Icon"
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  style={{ background: 'rgba(var(--theme-1), 0.15)' }}
                />
                <div className="flex-1 truncate">
                  <p className="text-sm font-semibold truncate" title={getDisplayName() || ''}>
                    {getDisplayName()}
                  </p>
                </div>
              </Link>
            </div>
          )}

          <div className="flex-1 overflow-auto min-h-0">
            <NavList />
          </div>

          {/* タコ */}
          {/* <div className="flex justify-center pb-4">
            <Image
              // onClick={sayHello}
              src={"oct.svg"}
              width={160}
              height={200}
              alt="oct"
              className="cursor-pointer block w-40 h-40 flex-shrink-0 object-cover"
            />
          </div> */}
        </div>
      </div>
      {/* 背景を暗く */}
      {isOpenBurger && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setisOpenBurger(false)}
        ></div>
      )}
    </>
  );
};

export default SideMenu;

