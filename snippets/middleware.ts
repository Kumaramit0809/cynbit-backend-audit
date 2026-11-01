// R3: middleware.ts, enforce auth on admin, portal and admin API
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  try {
    if (!token) throw new Error('no session');
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    if (req.nextUrl.pathname.startsWith('/admin') && payload.role !== 'admin')
      return NextResponse.json({ title: 'Forbidden', status: 403 }, { status: 403 });
    return NextResponse.next();
  } catch {
    if (req.nextUrl.pathname.startsWith('/api/'))
      return NextResponse.json({ title: 'Unauthorized', status: 401 }, { status: 401 });
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = { matcher: ['/admin/:path*', '/portal/:path*', '/api/admin/:path*'] };
