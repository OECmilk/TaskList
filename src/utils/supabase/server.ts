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
          } catch (error: unknown) {
            // Next.js: "Cookies can only be modified in a Server Action or Route Handler." が投げられることがある。
            // この場合は Server Component から呼ばれているため、ミドルウェア等でセッションが更新されていれば無視して安全。
            let msg: string
            if (error instanceof Error) {
              msg = error.message
            } else {
              msg = String(error)
            }
            if (msg.includes('Cookies can only be modified')) {
              // 警告を残して静かに無視する
              console.warn('[supabase/server] cookies.set ignored:', msg)
              return
            }
            // 上記以外のエラーは再スロー
            throw error
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            (await cookieStore).delete({ name, ...options })
          } catch (error: unknown) {
            let msg: string
            if (error instanceof Error) {
              msg = error.message
            } else {
              msg = String(error)
            }
            if (msg.includes('Cookies can only be modified')) {
              console.warn('[supabase/server] cookies.delete ignored:', msg)
              return
            }
            throw error
          }
        },
      },
    }
  )
}

