import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import ApiError from '@/lib/errors/APiError';
import User from '@/models/User';

export const authenticate = async (request: NextRequest) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    throw new ApiError('Please authenticate');
  }

  try {
    const payload = verifyToken(accessToken);
    return payload.sub;
  } catch (error) {
    throw new ApiError('Please authenticate');
  }
};

export const checkRole = (roles: string[]) => {
  return async (request: NextRequest) => {
    const userId = await authenticate(request);
    const user = await User.findById(userId);
    
    if (!user || !roles.includes(user.role)) {
      throw new ApiError('Forbidden');
    }
    
    return userId;
  };
};