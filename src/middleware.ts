import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*'); // Or specific origins
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export const config = {
  matcher: '/api/:path*', // Apply to all API routes
};