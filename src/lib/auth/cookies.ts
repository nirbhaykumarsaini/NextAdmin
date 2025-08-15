import { cookies } from 'next/headers';
import { CookieOptions } from '@/types/auth';

const defaultOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

export const setCookie = (name: string, value: string, options: Partial<CookieOptions> = {}) => {
  cookies().set(name, value, {
    ...defaultOptions,
    ...options,
  });
};

export const getCookie = (name: string) => {
  return cookies().get(name)?.value;
};

export const deleteCookie = (name: string) => {
  cookies().delete(name);
};