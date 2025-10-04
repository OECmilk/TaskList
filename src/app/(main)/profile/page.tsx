import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/auth/actions';

export default async function ProfilePage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // ユーザーセッションを取得
    const { data: { user } } = await supabase.auth.getUser();

    // ユーザーが存在しない場合はログインページにリダイレクト
    if (!user) {
        return redirect('/auth/login');
    }

    return (
        <div className="flex justify-center items-center h-full bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 text-center">
                <header className="text-2xl font-bold text-gray-900">
                    Profile
                </header>
                <div className="space-y-4">
                    <img 
                        src={user.user_metadata.avatar_url}
                        alt="User Icon"
                        className="w-20 h-20 rounded-full mt-2 justify-center mx-auto"
                    />
                    <p className='font-semibold'>{user.user_metadata.name}</p>
                    <p className="font-semibold">{user.email}</p>

                    {/* ログアウトボタン */}
                    <form action={signOut}>
                        <button 
                            type="submit"
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-cyan-700 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
