import { randomBytes } from 'crypto';
import { setCookie, getCookie } from './cookies';
import ApiError from '../errors/APiError';

export const generateCSRFToken = () => {
  return randomBytes(32).toString('hex');
};

export const verifyCSRFToken = (request: Request) => {
  const csrfToken = request.headers.get('X-CSRF-Token');
  const cookieToken = getCookie('csrfToken');
  
  if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
    throw new ApiError(403, 'Invalid CSRF token');
  }
};

export const setCSRFCookie = () => {
  const token = generateCSRFToken();
  setCookie('csrfToken', token, { maxAge: 86400 });
  return token;
};