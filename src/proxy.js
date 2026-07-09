import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlProxy = createMiddleware(routing);
const protectedRoutes = ['/dashboard', '/profile', '/orders', '/order-detail', '/tickets', '/admin', '/checkout', '/support'];

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

  // Check for saved locale preference in cookie
  const savedLocale = request.cookies.get('user-locale')?.value;
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  const currentLocale = routing.locales.includes(firstSegment) ? firstSegment : null;

  // If user has a saved locale and current URL doesn't match, redirect
  if (savedLocale && routing.locales.includes(savedLocale) && currentLocale && currentLocale !== savedLocale) {
    const newPath = pathname.replace(new RegExp(`^/${currentLocale}(/|$)`), `/${savedLocale}$1`);
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  const adminLocaleMatch = pathname.match(/^\/(en|fr)\/admin(\/.*)?$/);
  const adminPath = adminLocaleMatch ? `/admin${adminLocaleMatch[2] || ''}` : null;

  const normalizedPathname = adminPath || normalizePathname(pathname);

  const isProtected = protectedRoutes.some((route) => {
    return normalizedPathname === route || normalizedPathname.startsWith(`${route}/`);
  });

  if (isProtected && !token) {
    const locale = currentLocale || routing.defaultLocale;
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
