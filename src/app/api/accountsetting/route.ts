import { NextRequest, NextResponse } from 'next/server';
import AccountSetting from '@/models/AccountSettings';
import connectDB from '@/config/db';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const {
            welcome_bonus,
            global_batting,
            min_deposit,
            max_deposit,
            min_withdrawal,
            max_withdrawal,
            min_bid_amount,
            max_bid_amount,
            withdrawal_period,
            withdrawal_open_time,
            withdrawal_close_time,
        } = body;

        let accountSetting = await AccountSetting.findOne();

        if (accountSetting) {
            // Update existing settings
            accountSetting.welcome_bonus = welcome_bonus || accountSetting.welcome_bonus;
            accountSetting.global_batting = global_batting !== undefined ? global_batting : accountSetting.global_batting;
            accountSetting.min_deposit = min_deposit || accountSetting.min_deposit;
            accountSetting.max_deposit = max_deposit || accountSetting.max_deposit;
            accountSetting.min_withdrawal = min_withdrawal || accountSetting.min_withdrawal;
            accountSetting.max_withdrawal = max_withdrawal || accountSetting.max_withdrawal;
            accountSetting.min_bid_amount = min_bid_amount || accountSetting.min_bid_amount;
            accountSetting.max_bid_amount = max_bid_amount || accountSetting.max_bid_amount;
            accountSetting.withdrawal_period = withdrawal_period || accountSetting.withdrawal_period;
            accountSetting.withdrawal_open_time = withdrawal_open_time || accountSetting.withdrawal_open_time;
            accountSetting.withdrawal_close_time = withdrawal_close_time || accountSetting.withdrawal_close_time;

            await accountSetting.save();
        } else {
            // Create new settings
            accountSetting = await AccountSetting.create({
                welcome_bonus,
                global_batting,
                min_deposit,
                max_deposit,
                min_withdrawal,
                max_withdrawal,
                min_bid_amount,
                max_bid_amount,
                withdrawal_period,
                withdrawal_open_time,
                withdrawal_close_time,
            });
        }

        return NextResponse.json({
            status: true,
            message: 'Account Setting information saved successfully',
        });

    } catch (error: any) {
        console.error('Error saving account settings:', error);
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to save account setting information' },
        );
    }
}

// GET method to retrieve account settings
export async function GET() {
    try {
        await connectDB();

        const accountSetting = await AccountSetting.findOne();

        return NextResponse.json({
            status: true,
            data: accountSetting || {}
        });

    } catch (error: any) {
        return NextResponse.json(
            { status: false, message: error.message || 'Failed to fetch account setting information' },
        );
    }
}