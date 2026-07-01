import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(request) {
  const response = intlMiddleware(request);
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/dashboard', '/profile', '/orders'];
  const isProtected = protectedRoutes.some(r => pathname.includes(r));

  if (isProtected && !token) {
    const locale = pathname.split('/')[1] || 'fr';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
