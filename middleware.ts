import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    // This `try/catch` block is only here for the interactive tutorial.
    // Feel free to remove once you have Supabase connected.
    const { supabase, response } = createClient(request)

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ユーザーが未認証で、かつログインページ以外にアクセスしようとした場合
    if (!user && !request.nextUrl.pathname.startsWith('/login')) {
      // ログインページにリダイレクト
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // ユーザーが認証済みで、かつログインページにアクセスしようとした場合
    if (user && request.nextUrl.pathname.startsWith('/login')) {
      // ホームページにリダイレクト
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response

  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
