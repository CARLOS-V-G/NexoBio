import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));

  if (isProtected) {
    const token = request.cookies.get('sb-access-token')?.value
      ?? request.cookies.get('supabase-auth-token')?.value;

    // Check for supabase session cookies (they use project-specific names)
    const hasCookie = Array.from(request.cookies.getAll()).some(
      c => c.name.includes('auth-token') || c.name.includes('supabase')
    );

    if (!token && !hasCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
