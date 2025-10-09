import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for JWT signing - in production, use environment variables
const secretKey = process.env.SESSION_SECRET || 'code_review_platform_secret_key';
const key = new TextEncoder().encode(secretKey);

// List of routes that require authentication
const protectedRoutes = ['/', '/welcome', '/code-review', '/code-editor', '/profile'];
// List of routes that should not be accessible when logged in
const authRoutes = ['/login', '/signup'];

// Simple JWT verification for middleware
async function verifySessionToken(token: string | undefined): Promise<{ isAuth: boolean; userId?: string }> {
  if (!token) {
    return { isAuth: false };
  }

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    const { userId, expiresAt } = payload as unknown as { userId: string; expiresAt: Date };

    // Check if session is expired
    if (new Date(expiresAt) < new Date()) {
      return { isAuth: false };
    }

    return { isAuth: true, userId };
  } catch (error) {
    return { isAuth: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session token from cookies
  const sessionToken = request.cookies.get('session')?.value;
  
  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Check if the route is for authentication (login/signup)
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (isProtectedRoute) {
    // For protected routes, verify the session
    const { isAuth } = await verifySessionToken(sessionToken);
    
    if (!isAuth) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }
  
  if (isAuthRoute) {
    // For auth routes, check if user is already logged in
    const { isAuth } = await verifySessionToken(sessionToken);
    
    if (isAuth) {
      // Redirect to welcome page if already authenticated
      const url = request.nextUrl.clone();
      url.pathname = '/welcome';
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    '/',
    '/welcome',
    '/code-review/:path*',
    '/code-editor/:path*',
    '/profile/:path*',
    '/login',
    '/signup'
  ],
};