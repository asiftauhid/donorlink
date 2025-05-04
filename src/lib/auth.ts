"use server";

import { headers } from 'next/headers';
import { jwtVerify } from 'jose';

export async function getServerSession() {
  try {
    // Use headers() instead of cookies() to avoid the warning
    const headersList = headers();
    const cookieHeader = headersList.get('cookie') || '';
    
    // Parse the cookie header manually
    const cookies = parseCookies(cookieHeader);
    const token = cookies['donorlink_token'];
    
    if (!token) {
      return null;
    }
    
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const secret = new TextEncoder().encode(JWT_SECRET);
    
    try {
      const { payload } = await jwtVerify(token, secret);
      
      return {
        authenticated: true,
        user: {
          id: payload.id as string,
          email: payload.email as string,
          userType: payload.userType as 'donor' | 'clinic',
          name: payload.name as string
        }
      };
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return null;
    }
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

// Helper function to parse cookies from the cookie header
function parseCookies(cookieHeader: string) {
  const cookies: Record<string, string> = {};
  
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}