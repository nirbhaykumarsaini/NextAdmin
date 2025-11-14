import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import MainMarketBid from '@/models/MainMarketBid';
import GalidisawarBid from '@/models/GalidisawarBid';
import StarlineBid from '@/models/StarlineBid';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';
import Fund from '@/models/Fund';
import Withdrawal from '@/models/Withdrawal';

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '1'); // Default to today
    
    // Calculate date range based on selected option
    const { startDate, endDate } = calculateDateRange(days);

    // Fetch all data in parallel for better performance
    const [
      totalUsers,
      activeUsers,
      totalMainMarketBids,
      totalGalidisawarBids,
      totalStarlineBids,
      totalDeposits,
      totalWithdrawals,
      recentTransactions,
      userGrowthData,
      revenueData,
      todayFinancialData
    ] = await Promise.all([
      // Total Users
      AppUser.countDocuments(),
      
      // Active Users (users with activity in the selected date range)
      AppUser.countDocuments({
        $or: [
          { 'devices.last_login': { $gte: startDate } },
          { '_id': { 
            $in: await MainMarketBid.distinct('user_id', { created_at: { $gte: startDate } })
          }},
          { '_id': { 
            $in: await GalidisawarBid.distinct('user_id', { created_at: { $gte: startDate } })
          }},
          { '_id': { 
            $in: await StarlineBid.distinct('user_id', { created_at: { $gte: startDate } })
          }}
        ]
      }),
      
      // Total Main Market Bid Amount
      MainMarketBid.aggregate([
        { $match: { created_at: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      
      // Total Galidisawar Bid Amount
      GalidisawarBid.aggregate([
        { $match: { created_at: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      
      // Total Starline Bid Amount
      StarlineBid.aggregate([
        { $match: { created_at: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      
      // Total Deposits
      Transaction.aggregate([
        { 
          $match: { 
            type: 'credit',
            status: 'completed',
            created_at: { $gte: startDate, $lte: endDate }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Total Withdrawals
      Transaction.aggregate([
        { 
          $match: { 
            type: 'debit',
            status: 'completed',
            created_at: { $gte: startDate, $lte: endDate }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Recent Transactions (for activity feed)
      Transaction.find({ 
        status: 'completed',
        created_at: { $gte: startDate, $lte: endDate }
      })
        .populate('user_id', 'name mobile_number')
        .sort({ created_at: -1 })
        .limit(5),
      
      // User growth data for chart
      AppUser.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        { $limit: 30 }
      ]),
      
      // Revenue data for chart (total bids by day)
      MainMarketBid.aggregate([
        {
          $match: { created_at: { $gte: startDate, $lte: endDate } }
        },
        {
          $group: {
            _id: {
              year: { $year: '$created_at' },
              month: { $month: '$created_at' },
              day: { $dayOfMonth: '$created_at' }
            },
            total: { $sum: '$total_amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),

      // Today's financial data (bids count)
      getTodayFinancialData(startDate, endDate)
    ]);

    // Calculate total bid amount
    const totalBidAmount = 
      (totalMainMarketBids[0]?.total || 0) +
      (totalGalidisawarBids[0]?.total || 0) +
      (totalStarlineBids[0]?.total || 0);

    // Calculate net flow (deposits - withdrawals)
    const netFlow = (totalDeposits[0]?.total || 0) - (totalWithdrawals[0]?.total || 0);

    // Format user growth data for chart
    const formattedUserGrowth = userGrowthData.map(item => ({
      name: `${item._id.month}/${item._id.day}`,
      value: item.count
    }));

    // Format revenue data for chart
    const formattedRevenueData = revenueData.map(item => ({
      name: `${item._id.month}/${item._id.day}`,
      value: item.total
    }));

    // Format recent activity
    const recentActivity = recentTransactions.map(transaction => ({
      id: transaction._id.toString(),
      user: transaction.user_id?.name || `User ${transaction.user_id?.mobile_number}`,
      action: transaction.type === 'credit' ? 'made a deposit' : 'withdrew funds',
      amount: transaction.amount,
      time: formatTimeAgo(transaction.created_at)
    }));

    const dashboardData = {
      stats: {
        totalUsers,
        activeUsers,
        totalBidAmount,
        totalDeposits: totalDeposits[0]?.total || 0,
        totalWithdrawals: totalWithdrawals[0]?.total || 0,
        netFlow
      },
      todayStats: {
        deposits: todayFinancialData.deposits,
        withdrawals: todayFinancialData.withdrawals,
        profitLoss: todayFinancialData.profitLoss,
        totalbid: todayFinancialData.totalbid
      },
      charts: {
        userGrowth: formattedUserGrowth,
        revenue: formattedRevenueData
      },
      recentActivity,
      timeRange: {
        start: startDate,
        end: endDate,
        days
      }
    };

    return NextResponse.json({
      status: true,
      message: 'Dashboard data fetched successfully',
      data: dashboardData
    });

  } catch (error: unknown) {
    console.error('Dashboard API Error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { status: false, message: error.message },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';

    return NextResponse.json(
      { status: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to calculate date range based on selected option
function calculateDateRange(days: number) {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (days) {
    case 1: // Today
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 2: // Yesterday
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    default: // Last X days
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
  }
  
  return { startDate, endDate };
}

// Helper function to get today's financial data
async function getTodayFinancialData(startDate: Date, endDate: Date) {
  try {
    // Today's Deposits (only completed)
    const depositsAgg = await Fund.aggregate([
      {
        $match: {
          status: "approved",
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const todayDeposits = depositsAgg[0]?.total || 0;

    // Today's Withdrawals (only completed)
    const withdrawalsAgg = await Withdrawal.aggregate([
      {
        $match: {
          status: "approved",
          created_at: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const todayWithdrawals = withdrawalsAgg[0]?.total || 0;

    // Today's Total Bids from all markets
    const [mainMarketBids, starlineBids, galidisawarBids] = await Promise.all([
      MainMarketBid.aggregate([
        {
          $match: {
            created_at: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $unwind: "$bids"
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$bids.bid_amount" },
            count: { $sum: 1 }
          },
        },
      ]),
      
      StarlineBid.aggregate([
        {
          $match: {
            created_at: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $unwind: "$bids"
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$bids.bid_amount" },
            count: { $sum: 1 }
          },
        },
      ]),
      
      GalidisawarBid.aggregate([
        {
          $match: {
            created_at: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $unwind: "$bids"
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$bids.bid_amount" },
            count: { $sum: 1 }
          },
        },
      ]),
    ]);

    const mainMarketCount = mainMarketBids[0]?.count || 0;
    const starlineCount = starlineBids[0]?.count || 0;
    const galidisawarCount = galidisawarBids[0]?.count || 0;

    const totalbid = mainMarketCount + starlineCount + galidisawarCount;

    // Profit/Loss (Deposits - Withdrawals)
    const profitLoss = todayDeposits - todayWithdrawals;

    return {
      deposits: todayDeposits,
      withdrawals: todayWithdrawals,
      profitLoss,
      totalbid
    };
  } catch (error) {
    console.error('Error fetching today financial data:', error);
    return {
      deposits: 0,
      withdrawals: 0,
      profitLoss: 0,
      totalbid: 0
    };
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}