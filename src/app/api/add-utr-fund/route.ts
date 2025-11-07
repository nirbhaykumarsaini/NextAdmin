import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import connectDB from '@/config/db';
import UtrFund from '@/models/UtrFund';
import Transaction from '@/models/Transaction';
import ApiError from '@/lib/errors/APiError';
import { Types } from 'mongoose';

interface Query {
    status: string;
    user_id: string;
}
// Add a new fund request 
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const formData = await request.formData();
        const user_id = formData.get('user_id') as string;
        const amount = Number(formData.get('amount'));
        const utr_id = formData.get('utr_id') as string;
        const payment_image = formData.get('payment_image') as File;

        if (!user_id) {
            throw new ApiError('user_id are required')
        }

        if (!amount) {
            throw new ApiError('amount are required')
        }

        if (!utr_id) {
            throw new ApiError('utr_id are required')
        }

        if (!payment_image) {
            throw new ApiError('payment_image are required')
        }

        if (!payment_image.type.startsWith('image/')) {
            throw new ApiError('Only image files are allowed');
        }

        // Save image
        const uploadsDir = join(process.cwd(), 'public/payments');
        await mkdir(uploadsDir, { recursive: true });

        const timestamp = Date.now();
        const ext = payment_image.name.split('.').pop();
        const filename = `fund_${timestamp}.${ext}`;
        const filePath = join(uploadsDir, filename);
        const buffer = Buffer.from(await payment_image.arrayBuffer());
        await writeFile(filePath, buffer);

        const relativePath = `/payments/${filename}`;

        // Create pending transaction
        const transaction = await Transaction.create({
            user_id,
            amount,
            type: 'credit',
            status: 'pending',
            description: 'Fund added - awaiting approval'
        });

        // Create fund request
        await UtrFund.create({
            user_id,
            transaction_id: transaction._id,
            amount,
            utr_id,
            payment_image: relativePath,
            status: 'pending'
        });

        return NextResponse.json({
            status: true,
            message: 'Fund request submitted successfully'
        });

    } catch (error: unknown) {
        console.error('Fund POST Error:', error);
        const msg = error instanceof Error ? error.message : 'Failed to create fund';
        return NextResponse.json({ status: false, message: msg }, { status: 500 });
    }
}

//Get all fund requests (optional filter)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const user_id = searchParams.get('user_id');

        const query: Query = {
            status: '',
            user_id: ''
        };
        if (status) query.status = status;
        if (user_id) query.user_id = user_id;

        const funds = await UtrFund.find(query)
            .populate('user_id', 'name mobile_number balance')
            .populate('transaction_id', 'status type amount description')
            .sort({ created_at: -1 });

        return NextResponse.json({
            status: true,
            data: funds
        });

    } catch (error: unknown) {
        console.error('Fund GET Error:', error);
        const msg = error instanceof Error ? error.message : 'Failed to fetch funds';
        return NextResponse.json({ status: false, message: msg }, { status: 500 });
    }
}
