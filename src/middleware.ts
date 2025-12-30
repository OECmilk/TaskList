import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware-client'

export async function middleware(request: NextRequest) {

  try {
    const { supabase, response } = createClient(request)

    const {
      data: { user },
    } = await supabase.auth.getUser();


    // ユーザーが未認証で、かつログインページ以外にアクセスしようとした場合
    if (!user && !request.nextUrl.pathname.startsWith('/auth/login')) {
      // ログインページにリダイレクト
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // ユーザーが認証済みで、かつログインページにアクセスしようとした場合
    if (user && request.nextUrl.pathname.startsWith('/auth/login')) {
      // ホームページにリダイレクト
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response

  } catch (e) {
    console.error('Middleware Error:', e);

    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth routes (callback)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth|api/webhooks).*)',
  ],
}
