import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth/jwt';
import { IRegister } from '@/types/auth';
import ApiError from '@/lib/errors/APiError';
import { IUser } from '@/types/user';

export async function POST(request: Request) {
    try {
        await dbConnect();

        // Helper function to handle successful authentication
        const handleSuccessfulAuth = async (user: IUser) => {
            const accessToken = generateToken(user._id);

            const response = NextResponse.json({
                status: true,
                message: 'Registration successful',
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

        const body: IRegister = await request.json();

        if (!body.username || !body.password) {
            const missingFields = [];
            if (!body.username) missingFields.push('username');
            if (!body.password) missingFields.push('password');
            throw new ApiError(
                `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} required`);
        }

        if (!body.username.trim() || !body.password.trim()) {
            throw new ApiError('Username and password cannot be empty');
        }

        if (body.role && !['user', 'admin'].includes(body.role)) {
            throw new ApiError('Invalid role specified');
        }

        if (body.role === 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin) {
                throw new ApiError('Admin user already exists');
            }
        }

        const existingUser = await User.findOne({ username: body.username.trim() });
        if (existingUser) {
            throw new ApiError('Username already exists');
        }

        const user = await User.create({
            username: body.username.trim(),
            password: body.password,
            role: body.role || 'user'
        });

        return await handleSuccessfulAuth(user);

    } catch (error: unknown) {

        // Handle ApiError instances
        if (error instanceof ApiError) {
            return NextResponse.json(
                { status: false, message: error.message });
        }

        // Handle other Error instances
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
            const mongoError = error as { code?: number; keyPattern?: Record<string, unknown> };
            if (mongoError.code === 11000) {
                if (mongoError.keyPattern && 'username' in mongoError.keyPattern) {
                    return NextResponse.json(
                        { status: false, message: 'Username already exists' });
                }
                return NextResponse.json(
                    { status: false, message: 'Duplicate entry error. Please try again.' }
                );
            }

            // Generic error
            return NextResponse.json(
                { status: false, message: error.message || 'Internal server error' }
            );
        }
    }
}