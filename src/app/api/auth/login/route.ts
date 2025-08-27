import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth/jwt';
import { ILogin } from '@/types/auth';
import ApiError from '@/lib/errors/APiError';
import logger from '@/config/logger';
import { IUser } from '@/types/user';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const handleSuccessfulAuth = async (user: IUser) => {
            const accessToken = generateToken(user._id);

            const response = NextResponse.json({
                status: true,
                message: 'Login successful',
                user: {
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                accessToken,
            });

            return response;
        };

        const body: ILogin = await request.json();

        if (!body.username || !body.password) {
            throw new ApiError('Username and password are required');
        }

        const user = await User.findOne({ username: body.username })
            .select('+password')
            .exec();

        if (!user) {
            throw new ApiError('Incorrect username or password');
        }

        const isPasswordValid = await user.comparePassword(body.password);
        if (!isPasswordValid) {
            throw new ApiError('Incorrect username or password');
        }

        return await handleSuccessfulAuth(user);

    } catch (error: unknown) {
        logger.error(error);

        // Handle specific error types
        if (error instanceof ApiError) {
            return NextResponse.json(
                { status: false, message: error.message }
            );
        }

        if (error instanceof Error) {
            // Check for Mongoose validation errors
            if (error.name === 'ValidationError') {
                const mongooseError = error as { errors?: Record<string, { message: string }> };
                if (mongooseError.errors) {
                    const messages = Object.values(mongooseError.errors).map(val => val.message);
                    return NextResponse.json(
                        { status: false, message: messages.join(', ') });
                }
            }

            // Check for MongoDB duplicate key error
            if ((error as { code?: number }).code === 11000) {
                const mongoError = error as { keyPattern?: Record<string, unknown> };
                if (mongoError.keyPattern && 'username' in mongoError.keyPattern) {
                    return NextResponse.json(
                        { status: false, message: 'Username already exists' }
                    );
                }
                return NextResponse.json(
                    { status: false, message: 'Duplicate entry error' }
                );
            }

            // Generic error
            return NextResponse.json(
                { status: false, message: error.message || 'Internal server error' }
            );
        }

        // Unknown error type
        return NextResponse.json(
            { status: false, message: 'Internal server error' }
        );
    }
}