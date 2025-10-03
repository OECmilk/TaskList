'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from "next/headers";
import { headers } from 'next/headers'

/**
 * Emailとパスワードでログインする
 */
export async function login(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    // エラーメッセージをクエリパラメータとしてリダイレクト
    return redirect(`/login?message=Could not authenticate user`);
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

/**
 * Emailとパスワードでサインアップする
 */
export async function signup(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const origin = (await headers()).get('origin');

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // ユーザーが確認メールのリンクをクリックした後のリダイレクト先
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('Signup error:', error.message);
    return redirect('/login?message=Could not authenticate user');
  }

  // 新規登録後は確認メールを送信した旨のメッセージを表示
  return redirect('/login?message=Check email to continue sign in process');
}

/**
 * OAuthプロバイダー（Google, GitHub）でサインインする
 * @param provider - 'google' または 'github'
 */
export async function signInWithOAuth(formData: FormData) {
    const provider = formData.get('provider') as 'google' | 'github';
    
    if (!provider) {
        return redirect('/login?message=No provider selected');
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const origin = (await headers()).get('origin');

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        console.error('OAuth error:', error.message);
        return redirect('/login?message=Could not authenticate with provider');
    }

    // ユーザーをプロバイダーの認証ページにリダイレクト
    return redirect(data.url);
}


/**
 * ユーザーをログアウトさせる
 */
export async function signOut() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  await supabase.auth.signOut();
  
  revalidatePath('/', 'layout');
  return redirect('/login');
}
