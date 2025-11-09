import SideMenu from "@/components/SideMenu/SideMenu";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { createClient } from "@/utils/supabase/server";
import { Profile } from "@/contexts/ProfileContext";
import { type Notification } from "@/components/SideMenu/SideMenu";
import { Suspense } from 'react';

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
            tasks ( id, title ),
            users:notifications_from_user_id_fkey ( name, icon )
          `)
          .eq('to_user_id', user.id)
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
      initialNotifications = notificationResult.data as unknown as Notification[];
      initialUnreadCount = initialNotifications.filter(n => n.is_read === false).length;
    }
  }

  return (
    <ProfileProvider>
      <div className="flex h-screen">
          <SideMenu 
            initialProfile={initialProfile}
            initialUnreadCount={initialUnreadCount}
            initialNotifications={initialNotifications}
          />
          <main className="bg-slate-50 flex-1 overflow-auto relative">
            <Suspense>
              { children }
            </Suspense>
            { drawer }
          </main>
      </div>
    </ProfileProvider>
  );
};
 
export default MainLayout;