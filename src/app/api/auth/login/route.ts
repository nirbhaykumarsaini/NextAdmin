import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth/jwt';
import { ILogin, IRegister } from '@/types/auth';
import ApiError from '@/lib/errors/APiError';
import logger from '@/config/logger';



export async function POST(request: Request) {
    try {
        await dbConnect();

        // Helper function to handle successful authentication
        const handleSuccessfulAuth = async (user: any) => {
            const accessToken = generateToken(user._id);

            const response = NextResponse.json({
                status: true,
                message: 'Authentication successful',
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

    } catch (error: any) {
        logger.error(error);

        if (error instanceof ApiError) {
            return NextResponse.json(
                { status: false, message: error.message },
            );
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val: any) => val.message);
            return NextResponse.json(
                { status: false, message: messages.join(', ') },
            );
        }

        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.username) {
                return NextResponse.json(
                    { status: false, message: 'Username already exists' },

                );
            }
            return NextResponse.json(
                { status: false, message: 'Session error. Please try again.' },
            );
        }

        return NextResponse.json(
            { status: false, message: error.message || 'Internal server error' },
        );
    }
}