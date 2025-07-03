import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedRoutes = [
  { path: '/admin', role: 'admin' },
  { path: '/teacher', role: 'teacher' },
  { path: '/student', role: 'student' },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  for (const route of protectedRoutes) {
    if (pathname.startsWith(route.path)) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      if (token.role !== route.role) {
        return NextResponse.redirect(new URL(`/${token.role}`, req.url));
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*'],
}; 