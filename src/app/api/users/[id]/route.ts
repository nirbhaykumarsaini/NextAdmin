import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import userService from '@/services/user.service';
import ApiError from '@/lib/errors/APiError';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await authenticate(request);
    
    const user = await userService.getUserById(params.id);
    return NextResponse.json(user);
  } catch (error) {
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

