import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define which routes should be protected
const protectedRoutes = [
  '/dashboard/donor',
  '/dashboard/clinic',
];

export async function middleware(request: NextRequest) {
  // Get the pathname from the request
  const pathname = request.nextUrl.pathname;
  
  // Check if the route should be protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('donorlink_token')?.value;
    
    // If there's no token, redirect to login
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    
    try {
      // Verify the token
      const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
      await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      
      // If verification is successful, allow the request
      return NextResponse.next();
    } catch (error) {
      // If verification fails, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // For non-protected routes, just continue
  return NextResponse.next();
}

// Specify the paths for which this middleware should run
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};