import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/auth/actions';
import Image from 'next/image';
import EditProfileButton from '@/components/Button/EditProfileButton';
export const dynamic = 'force-dynamic';

export type Profile = {
    name: string;
    icon: string | null;
    email: string;
};

export default async function ProfilePage() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/auth/login');
    }

    // usersテーブルからプロフィール情報を取得
    const { data: profileData, error } = await supabase
        .from('users')
        .select('name, icon')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile in ProfilePage:', error);
    }

    const profile: Profile = {
        name: profileData?.name || '',
        icon: profileData?.icon || null,
        email: user.email || '',
    };

    return (
        <div className="p-8 sm:p-10 h-full bg-gray-50">
            <header className="w-full max-w-xl">
                <h1 className="text-2xl font-bold text-gray-900">
                    Profile
                </h1>
            </header>
            <div className="max-w-xl mx-auto p-8 space-y-6 text-center">
                <Image
                    src={profile?.icon || "/default_icon.svg"}
                    alt="User Avatar"
                    width={96} // w-24
                    height={96} // h-24
                    className="w-24 h-24 rounded-full mx-auto border-2 border-gray-300 p-1 object-cover"
                />
                {/* ユーザー名とEmailを表示 */}
                <div className="space-y-1">
                    <p className='text-xl font-semibold'>{profile?.name || 'No name set'}</p>
                    <p className="text-gray-500">{user.email}</p>
                </div>

                {/* Edit Profileボタン */}
                <EditProfileButton />

                {/* ログアウトボタン */}
                <form action={signOut}>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-sm font-medium text-cyan-700 bg-white border border-cyan-700 rounded-md hover:bg-cyan-50"
                    >
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    );
}
