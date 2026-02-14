import SideMenu from "@/components/SideMenu/SideMenu";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { createClient } from "@/utils/supabase/server";
import { Profile } from "@/contexts/ProfileContext";
import { type Notification } from "@/components/SideMenu/SideMenu";
import { Suspense } from 'react';
export const dynamic = 'force-dynamic';

const MainLayout = async ({
  children,
  drawer,
}: Readonly<{
  children: React.ReactNode;
  drawer: React.ReactNode;
}>) => {

  const supabase = createClient();

  let initialProfile: Profile | null = null;
  let initialUnreadCount: number = 0;
  let initialNotifications: Notification[] = [];

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // プロフィール情報と未読通知件数を並列で取得

    const [profileResult, notificationResult] = await Promise.all([
      supabase
        .from('users')
        .select('name, icon')
        .eq('id', user.id)
        .single(),
      supabase
        .from('notifications')
        .select(`
            id,
            created_at,
            action_type,
            is_read,
            from_user_id, 
            tasks ( id, title ),
            users:notifications_from_user_id_fkey ( name, icon )
          `)
        .eq('to_user_id', user.id)
        .limit(20)
        .order('created_at', { ascending: false })
    ]);

    if (profileResult.error) {
      console.error('Error fetching profile in layout:', profileResult.error);
    }

    // userProfileオブジェクトを構築
    initialProfile = {
      id: user.id,
      name: profileResult.data?.name || null,
      icon: profileResult.data?.icon || null,
      email: user.email || ''
    };

    if (notificationResult.error) {
      console.error('Error fetching unread count in layout:', notificationResult.error);
    }
    else if (notificationResult.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawNotifications = notificationResult.data as any[];

      initialNotifications = await Promise.all(rawNotifications.map(async (n) => {
        let chatMessage = undefined;
        if (n.action_type === 'CHAT_MENTION') {
          const { data: chatData } = await supabase
            .from('chats')
            .select('message')
            .eq('task_id', n.tasks.id)
            .eq('user_id', n.from_user_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (chatData) {
            chatMessage = chatData.message;
          }
        }
        return {
          ...n,
          chat_message: chatMessage
        } as Notification;
      }));

      // Calculate count from the processed list
      initialUnreadCount = initialNotifications.filter(n => n.is_read === false).length;
    }
  }

  return (
    <ProfileProvider initialProfile={initialProfile}>
      <div className="flex h-screen">
        <SideMenu
          initialUnreadCount={initialUnreadCount}
          initialNotifications={initialNotifications}
        />
        <main className="bg-slate-50 flex-1 overflow-auto relative">
          <Suspense>
            {children}
          </Suspense>
          {drawer}
        </main>
      </div>
    </ProfileProvider>
  );
};

export default MainLayout;