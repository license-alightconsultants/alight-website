import { NextResponse } from 'next/server';

// First line of defence only: bounces requests without a session cookie.
// Real session validation and permission checks happen server-side in every admin page and action.
const PUBLIC_ADMIN = ['/admin/login', '/admin/setup'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (!request.cookies.get('alight_session')) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = { matcher: ['/admin/:path*'] };
