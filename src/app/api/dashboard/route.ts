import { NextResponse } from 'next/server';
import dbConnect from '@/config/db';
import ApiError from '@/lib/errors/APiError';
import MainMarketBid from '@/models/MainMarketBid';
import GalidisawarBid from '@/models/GalidisawarBid';
import StarlineBid from '@/models/StarlineBid';
import AppUser from '@/models/AppUser';
import Transaction from '@/models/Transaction';

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    // Fetch all data in parallel
    const [
      totalUsers,
      activeUsers,
      totalMainMarketBids,
      totalGalidisawarBids,
      totalStarlineBids,
      totalDeposits,
      recentTransactions,
      userGrowthData,
      revenueData
    ] = await Promise.all([
      // Total Users
      AppUser.countDocuments(),
      
      // Active Users (users who placed bids in last 7 days)
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
        { $match: { created_at: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      
      // Total Galidisawar Bid Amount
      GalidisawarBid.aggregate([
        { $match: { created_at: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      
      // Total Starline Bid Amount
      StarlineBid.aggregate([
        { $match: { created_at: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      
      // Total Deposits
      Transaction.aggregate([
        { 
          $match: { 
            type: 'debit',
            status: 'completed',
            created_at: { $gte: startDate }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Recent Transactions (for activity feed)
      Transaction.find({ 
        status: 'completed',
        created_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      })
        .populate('user_id', 'name mobile_number')
        .sort({ created_at: -1 })
        .limit(5),
      
      // User growth data for chart
      AppUser.aggregate([
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
          $match: { created_at: { $gte: startDate } }
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
      ])
    ]);

    // Calculate total bid amount
    const totalBidAmount = 
      (totalMainMarketBids[0]?.total || 0) +
      (totalGalidisawarBids[0]?.total || 0) +
      (totalStarlineBids[0]?.total || 0);

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
        totalDeposits: totalDeposits[0]?.total || 0
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