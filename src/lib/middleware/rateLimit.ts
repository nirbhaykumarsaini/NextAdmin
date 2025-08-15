import { NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 1, // per 1 second
});

export const rateLimitMiddleware = async (request: Request) => {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    await rateLimiter.consume(ip);
    return null;
  } catch (error) {
    return NextResponse.json(
      { message: 'Too many requests' },
      // { status: false }
    );
  }
};