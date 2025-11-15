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
};

interface SideMenuProps {
  initialProfile: Profile | null;
  initialUnreadCount: number;
  initialNotifications: Notification[];
}

const SideMenu = ({ initialProfile, initialUnreadCount, initialNotifications }: SideMenuProps) => {

  const [isOpenBurger, setisOpenBurger] = useState(false);
  const { profile, setProfile } = useProfile();
  const [isOpenNotifications, setIsOpenNotifications] = useState(false);
  const [countUnread, setCountUnread] = useState<number>(initialUnreadCount);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const pathname = usePathname();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);

  // 元のfaviconのHREFを記憶するためのref
  const originalFaviconHref = useRef<string>('');

  // ... (Contextへの初回データセットuseEffectは変更なし)
  useEffect(() => {
    if (initialProfile && !profile) {
      setProfile(initialProfile);
    }
  }, [initialProfile, profile, setProfile]);

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
                    }
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
              
              // まず、新しい通知リストを作成
              const newList = currentList.map(n => 
                n.id === payload.new.id ? { ...n, is_read: payload.new.is_read } : n
              );
              
              //  次に、その「新しいリスト」を基に、未読件数を再計算
              const newUnreadCount = newList.filter(n => !n.is_read).length;
              
              //  件数用のstateもここで更新
              setCountUnread(newUnreadCount);
              
              //  最後に、新しいリストを返す
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
        className={`md:hidden fixed top-3 left-4 z-30 ${isOpenBurger ? "text-white" : "text-gray-800"}`}
        onClick={() => setisOpenBurger(!isOpenBurger)}
        aria-label="サイドメニューを開閉する"
      >
        {isOpenBurger ? <></> : <FaBars size={20} />}
      </button>
      
    <div className={`w-62 bg-cyan-900 text-white fixed h-full z-20 transform transition-transform duration-300 ease-in-out overflow-hidden
      ${isOpenBurger ? "translate-x-0" : "-translate-x-full"}
      md:relative md:translate-x-0`}
    >
    <div className="flex flex-col h-full min-h-0">
      <div className="pt-6">
                {/* 通知ボタン */}
                <div className="relative">
                  <FaRegBell 
                    onClick={handleBellClick} 
                    className="size-11 ml-auto mr-4 mb-2 rounded-full p-2 hover:bg-cyan-800 cursor-pointer z-50" 
                  />
                  {countUnread > 0 && (
                    <div className="absolute top-0 right-4 w-5 h-5 bg-orange-500 rounded-full border-2 border-cyan-900 text-xs flex justify-center font-bold">
                      { countUnread }
                    </div>
                  )}
                </div>

                {/* 通知ボード本体（ポータルで body にレンダリングして、親の transform/overflow による切り取りを回避） */}
                {
                  mounted && createPortal(
                    <div className={`w-62 md:w-80 bg-white fixed h-full z-50 top-0 text-black shadow-xl transition-transform duration-300 ease-in-out
                      ${isOpenNotifications ? 'translate-x-0' : '-translate-x-full'}`}>

                      <div className="flex border-b p-4 items-center">
                        <h2 className="px-2 text-xl font-bold">Notifications</h2>
                        <FaArrowLeft 
                          onClick={() => {setIsOpenNotifications(false)}}
                          className="size-10 ml-auto p-2 text-gray-500 hover:bg-gray-100 rounded-full cursor-pointer"
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
                            <p className="text-gray-500 text-center p-6">No notifications yet.</p>
                          )}
                        </ul>
                      </div>

                    </div>,
                    document.body
                  )
                }

              {/* userと、Contextから取得したprofileを使ってUIを構築 */}
              {profile && (
                <div className="p-4 border-t border-cyan-800">
                  <Link href="/profile" className={`flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-cyan-800 ${pathname === '/profile' ? 'bg-cyan-800' : ''}`}>
                    <Image
                      src={ profile.icon || "/default_icon.svg" }
                      width={40}
                      height={40}
                      alt="User Icon"
                      className="w-10 h-10 rounded-full bg-cyan-700 object-cover"
                    />
                    <div className="flex-1 truncate">
                      <p className="text-sm font-semibold truncate" title={getDisplayName() || ''}>
                          {getDisplayName()}
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto min-h-0">
              <NavList />
            </div>

            {/* タコ */}
            {/* {helloStatus && (
              <div className="">まいど。</div>
            )} */}
            <Image
              // onClick={sayHello}
              src={ "oct.svg" }
              width={160}
              height={200}
              alt="oct"
              className="cursor-pointer block w-40 h-40 flex-shrink-0 object-cover"
            />
        </div>
      </div>
      {/* 背景を暗く */}
      {isOpenBurger && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-15"
          onClick={() => setisOpenBurger(false)}
        ></div>
        )}
    </>
  ) ;
};

export default SideMenu;

