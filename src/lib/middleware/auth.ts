import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getCookie } from '@/lib/auth/cookies';
import ApiError from '@/lib/errors/APiError';
import Token from '@/models/Token';
import User from '@/models/User';

export const authenticate = async (request: NextRequest) => {
  const accessToken = getCookie('accessToken') || request.headers.get('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    throw new ApiError(401, 'Please authenticate');
  }

  try {
    const payload = verifyToken(accessToken);
    return payload.sub;
  } catch (error) {
    throw new ApiError(401, 'Please authenticate');
  }
};

export const checkRole = (roles: string[]) => {
  return async (request: NextRequest) => {
    const userId = await authenticate(request);
    const user = await User.findById(userId);
    
    if (!user || !roles.includes(user.role)) {
      throw new ApiError(403, 'Forbidden');
    }
    
    return userId;
  };
};