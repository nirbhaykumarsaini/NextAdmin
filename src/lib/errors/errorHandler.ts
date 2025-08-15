import { NextResponse } from 'next/server';
import ApiError from './APiError';

export const errorHandler = (error: Error) => {
  // Handle known ApiError
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        status: false,
        message: error.message
      },
      { status: error.statusCode }
    );
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  // Handle all other errors
  return NextResponse.json(
    {
      status: false,
      message: error.message || 'Internal Server Error'
    },
    { status: 500 }
  );
};