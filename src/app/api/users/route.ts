import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import userService from '@/services/user.service';

export async function GET(request: Request) {
  try {
    await authenticate(request);
    
    const users = await userService.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode || 500 }
    );
  }
}