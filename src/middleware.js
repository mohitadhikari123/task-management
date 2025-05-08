import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/tasks',
  '/tasks/create',
  '/profile',
  '/settings',
];

// Define auth routes (login, register) that should redirect to dashboard if user is already logged in
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if there's a token (user is logged in)
  const token = request.cookies.get('jwt')?.value;
  
  // If accessing a protected route and not logged in, redirect to login
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  // If accessing auth routes and already logged in, redirect to dashboard
  if (authRoutes.some(route => pathname.startsWith(route)) && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/... (public image files)
     * - api routes (handled by their own auth middleware)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|api).*)',
  ],
}; 