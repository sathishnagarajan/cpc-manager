import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (publicRoutes.includes(pathname) || pathname === '/') {
    return NextResponse.next();
  }
  
  const token = request.cookies.get('admin_token')?.value;
  
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/admin/users', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)'],
};
