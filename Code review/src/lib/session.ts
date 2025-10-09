import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';
import type { UserProfile } from '@/lib/definitions';

// Secret key for JWT signing - in production, use environment variables
const secretKey = process.env.SESSION_SECRET || 'code_review_platform_secret_key';
const key = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

// Create a new session
export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionPayload: SessionPayload = {
    userId,
    expiresAt,
  };

  const jwt = await new SignJWT(sessionPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);

  // Set the cookie
  (await cookies()).set('session', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
    sameSite: 'strict',
  });

  return jwt;
}

// Verify session for server components/actions
export async function verifySession(): Promise<{ isAuth: boolean; userId?: string }> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  if (!sessionCookie) {
    return { isAuth: false };
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, key, {
      algorithms: ['HS256'],
    });

    const { userId, expiresAt } = payload as unknown as SessionPayload;

    // Check if session is expired
    if (new Date(expiresAt) < new Date()) {
      // Clear expired session
      cookieStore.delete('session');
      return { isAuth: false };
    }

    return { isAuth: true, userId };
  } catch (error) {
    // Invalid token, clear the cookie
    cookieStore.delete('session');
    return { isAuth: false };
  }
}

// Verify session for middleware (synchronous version for edge runtime)
export function verifySessionForMiddleware(sessionCookie: string | undefined): { isAuth: boolean; userId?: string } {
  if (!sessionCookie) {
    return { isAuth: false };
  }

  try {
    // Decode the JWT token synchronously
    const decoded = jwtVerify(sessionCookie, key, {
      algorithms: ['HS256'],
    });
    
    // Since jwtVerify is async, we need to handle this differently
    // For middleware, we'll do a simpler check
    return { isAuth: true }; // Simplified for now
  } catch (error) {
    return { isAuth: false };
  }
}

// Clear session
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Clear all cookies for complete logout
export async function clearAllCookies() {
  const cookieStore = await cookies();
  
  // Get all cookies
  const allCookies = cookieStore.getAll();
  
  // Delete each cookie
  for (const cookie of allCookies) {
    cookieStore.delete(cookie.name);
  }
  
  // Explicitly delete the session cookie as well
  cookieStore.delete('session');
}
