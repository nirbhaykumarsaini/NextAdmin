import { cookies } from 'next/headers';
import { CookieOptions } from '@/types/auth';
import { NextResponse } from 'next/server';

const defaultOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

export const setCookie = async (name: string, value: string, options: Partial<CookieOptions> = {}) => {
  const cookieStore = cookies();
  (await cookieStore).set(name, value, {
    ...defaultOptions,
    ...options,
  });
};

export const getCookie = async (name: string) => {
  return (await cookies()).get(name)?.value;
};

export const deleteCookie = async (name: string) => {
  (await cookies()).delete(name);
};

// In your cookies.ts file
export async function clearCookie(name: string) {
  const response = NextResponse.next();
  response.cookies.set(name, '', {
    maxAge: -1, // Expire immediately
    path: '/',
  });
  return response;
}