import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import AppUser from '@/models/AppUser';
import ApiError from '@/lib/errors/APiError';

export async function validateBidEligibility(user_id: string): Promise<{ isValid: boolean; error?: string }> {
    try {
        await dbConnect();
        
        // Check if user exists
        const user = await AppUser.findById(user_id);
        if (!user) {
            return { isValid: false, error: 'User not found' };
        }

        // Check if user is blocked
        if (user.is_blocked) {
            return { isValid: false, error: 'User account is blocked. Please contact support.' };
        }

        // Check if batting is enabled
        if (!user.batting) {
            return { isValid: false, error: 'Batting is currently disabled for your account' };
        }

        return { isValid: true };
    } catch (error) {
        console.error('Error in bid eligibility validation:', error);
        return { isValid: false, error: 'Internal server error during validation' };
    }
}

// Middleware function for bid routes
export async function bidValidationMiddleware(request: NextRequest) {
    try {
        // Only apply to POST requests for placing bids
        if (request.method !== 'POST') {
            return NextResponse.next();
        }

        const body = await request.json();
        const { user_id } = body;

        if (!user_id) {
            return NextResponse.json(
                { status: false, message: 'User ID is required' },
                { status: 400 }
            );
        }

        const validation = await validateBidEligibility(user_id);
        
        if (!validation.isValid) {
            return NextResponse.json(
                { status: false, message: validation.error },
                { status: 403 }
            );
        }

        // Continue to the actual route handler
        return NextResponse.next();
    } catch (error) {
        console.error('Middleware error:', error);
        return NextResponse.json(
            { status: false, message: 'Invalid request format' },
            { status: 400 }
        );
    }
}