import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt'; // adjust path as needed
import { JwtPayload } from 'jsonwebtoken';

export const getUserIdFromToken = (request: NextRequest): string | null => {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token) as JwtPayload;
    
    // Handle different token payload structures
    if (typeof decoded.sub === 'string') {
      return decoded.sub;
    } else if (decoded.sub && typeof decoded.sub === 'object') {
      // If sub is an object, extract the id
      return (decoded.sub as any).id || (decoded.sub as any)._id;
    } else if (decoded.user_id) {
      // Alternative: check for userId field
      return decoded.user_id;
    }
    
    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}