import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// この新しい createClient は引数を取りません
export const createClient = () => {
  // 1. cookieStoreを関数の中で取得します
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          // 2. set/remove処理をtry...catchでラップします
          try {
            (await cookieStore).set({ name, value, ...options })
          } catch (error) {
            // Server Component から 'set' が呼ばれた場合。
            // Middleware がセッションをリフレッシュしていれば無視できる。
            throw error;
          } 
        },
        async remove(name: string, options: CookieOptions) {
          try {
            (await cookieStore).delete({ name, ...options })
          } catch (error) {
            // Server Component から 'delete' が呼ばれた場合。
            // Middleware がセッションをリフレッシュしていれば無視できる。
            throw error;
          }
        },
      },
    }
  )
}

