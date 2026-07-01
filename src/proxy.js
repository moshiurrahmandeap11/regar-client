import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlProxy = createMiddleware(routing);
const protectedRoutes = ['/dashboard', '/profile', '/orders', '/admin'];

function normalizePathname(pathname) {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0 && routing.locales.includes(segments[0])) {
    return `/${segments.slice(1).join('/')}` || '/';
  }

  return pathname;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const adminLocaleMatch = pathname.match(/^\/(en|fr)\/admin(\/.*)?$/);
  const adminPath = adminLocaleMatch ? `/admin${adminLocaleMatch[2] || ''}` : null;

  const normalizedPathname = adminPath || normalizePathname(pathname);

  const isProtected = protectedRoutes.some((route) => {
    return normalizedPathname === route || normalizedPathname.startsWith(`${route}/`);
  });

  if (isProtected && !token) {
    const firstSegment = pathname.split('/').filter(Boolean)[0];
    const locale = routing.locales.includes(firstSegment) ? firstSegment : routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (adminPath) {
    return NextResponse.rewrite(new URL(adminPath, request.url));
  }

  if (normalizedPathname === '/admin' || normalizedPathname.startsWith('/admin/')) {
    return NextResponse.next();
  }

  const response = intlProxy(request);

  return response;
}

export default proxy;

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
