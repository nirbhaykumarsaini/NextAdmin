import { NextRequest, NextResponse } from 'next/server';
import AccountSetting from '@/models/AccountSettings';
import connectDB from '@/config/db';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        console.log("body", body);
        
        const {
            welcome_bonus,
            global_batting,
            min_deposit,
            max_deposit,
            min_withdrawal,
            max_withdrawal,
            min_bid_amount,
            max_bid_amount,
            withdrawal_days,
            withdrawal_period,
            withdrawal_open_time,
            withdrawal_close_time,
        } = body;

        let accountSetting = await AccountSetting.findOne();

        // Validate withdrawal_days array
        const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        const sanitizedWithdrawalDays = Array.isArray(withdrawal_days) 
            ? withdrawal_days.filter(day => validDays.includes(day))
            : [];

        if (accountSetting) {
            // Update existing settings using $set to ensure new fields are added
            const updateData: any = {
                welcome_bonus: welcome_bonus !== undefined ? welcome_bonus : accountSetting.welcome_bonus,
                global_batting: global_batting !== undefined ? global_batting : accountSetting.global_batting,
                min_deposit: min_deposit !== undefined ? min_deposit : accountSetting.min_deposit,
                max_deposit: max_deposit !== undefined ? max_deposit : accountSetting.max_deposit,
                min_withdrawal: min_withdrawal !== undefined ? min_withdrawal : accountSetting.min_withdrawal,
                max_withdrawal: max_withdrawal !== undefined ? max_withdrawal : accountSetting.max_withdrawal,
                min_bid_amount: min_bid_amount !== undefined ? min_bid_amount : accountSetting.min_bid_amount,
                max_bid_amount: max_bid_amount !== undefined ? max_bid_amount : accountSetting.max_bid_amount,
                withdrawal_period: withdrawal_period || accountSetting.withdrawal_period,
                withdrawal_open_time: withdrawal_open_time || accountSetting.withdrawal_open_time,
                withdrawal_close_time: withdrawal_close_time || accountSetting.withdrawal_close_time,
            };

            // Always set withdrawal_days if provided, otherwise keep existing or set to empty array
            if (withdrawal_days !== undefined) {
                updateData.withdrawal_days = sanitizedWithdrawalDays;
            }

            // Use findOneAndUpdate to ensure the document is properly updated with new fields
            accountSetting = await AccountSetting.findOneAndUpdate(
                {}, 
                { $set: updateData },
                { new: true, upsert: true }
            );

        } else {
            // Create new settings
            accountSetting = await AccountSetting.create({
                welcome_bonus: welcome_bonus !== undefined ? welcome_bonus : 10,
                global_batting: global_batting !== undefined ? global_batting : true,
                min_deposit: min_deposit !== undefined ? min_deposit : 1,
                max_deposit: max_deposit !== undefined ? max_deposit : 100000,
                min_withdrawal: min_withdrawal !== undefined ? min_withdrawal : 10,
                max_withdrawal: max_withdrawal !== undefined ? max_withdrawal : 10000,
                min_bid_amount: min_bid_amount !== undefined ? min_bid_amount : 10,
                max_bid_amount: max_bid_amount !== undefined ? max_bid_amount : 10000,
                withdrawal_days: sanitizedWithdrawalDays,
                withdrawal_period: withdrawal_period || "morning",
                withdrawal_open_time: withdrawal_open_time || "",
                withdrawal_close_time: withdrawal_close_time || "",
            });
        }

        console.log("Updated account setting:", accountSetting);

        return NextResponse.json({
            status: true,
            message: 'Account settings saved successfully',
        });

    } catch (error: unknown) {
        console.error('Error saving account settings:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save account settings';
        return NextResponse.json(
            { status: false, message: errorMessage }
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

    } catch (error: unknown) {
        console.error('Error fetching account settings:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch account settings';
        return NextResponse.json(
            { status: false, message: errorMessage }
        );
    }
}