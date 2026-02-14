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
        <div className="p-8 sm:p-10 h-full">
            <header className="w-full max-w-xl">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Profile
                </h1>
            </header>
            <div className="max-w-xl mx-auto mt-6">
                <div className="card p-8 space-y-6 text-center">
                    <Image
                        src={profile?.icon || "/default_icon.svg"}
                        alt="User Avatar"
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full mx-auto object-cover"
                        style={{ border: '3px solid var(--color-accent)', padding: '2px' }}
                    />
                    {/* ユーザー名とEmailを表示 */}
                    <div className="space-y-1">
                        <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {profile?.name || 'No name set'}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{user.email}</p>
                    </div>

                    {/* Edit Profileボタン */}
                    <EditProfileButton />

                    {/* ログアウトボタン */}
                    <form action={signOut}>
                        <button
                            type="submit"
                            className="btn-secondary w-full"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
