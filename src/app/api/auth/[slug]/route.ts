import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/utils/validator';
import { loginSchema, registerSchema } from '@/schemas/auth';
import authService from '@/services/auth.service';
import ApiError from '@/lib/errors/APiError';
import dbConnect from '@/config/db';


export async function POST(request: Request) {
  try {

     await dbConnect();
    const { pathname } = new URL(request.url);
    
    if (pathname.endsWith('/login')) {
      const body = await request.json();
      const validated = await validateRequest(loginSchema, body);
      const result = await authService.login(validated);
      return NextResponse.json(result);
    }
    
    if (pathname.endsWith('/register')) {
      const body = await request.json();
      const validated = await validateRequest(registerSchema, body);
      const result = await authService.register(validated);
      return NextResponse.json(result);
    }
    
    return NextResponse.json({ message: 'Not Found' });
  } catch (error) {
    // Properly type the error
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
      );
    }
    
    // Handle other types of errors
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
      );
    }
    
    // Fallback for unknown errors
    return NextResponse.json(
      { message: 'An unknown error occurred' },
    );
  }
}