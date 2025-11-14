import React from 'react'
import StatCard from './StatCard'
import { FiActivity, FiDollarSign, FiTrendingUp, FiUsers } from 'react-icons/fi'

interface DashboardCardProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalBidAmount: number;
    totalDeposits: number;
    totalWithdrawals: number;
    netFlow: number;
  };
  todayStats: {
    deposits: number;
    withdrawals: number;
    profitLoss: number;
    totalbid: number;
  };
  calculateChange: (current: number, previous: number) => string;
}

const DashboardCard = ({ stats, todayStats, calculateChange }: DashboardCardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        link="/users/manage"
        title="Total Users"
        value={stats?.totalUsers?.toLocaleString()}
        change={calculateChange(stats.totalUsers, stats.totalUsers * 0.9)}
        icon={<FiUsers className="h-4 w-4 text-blue-500" />}
      />
      <StatCard
        title="Active Users"
        link="/users/manage"
        value={stats?.activeUsers?.toLocaleString()}
        change={calculateChange(stats.activeUsers, stats.activeUsers * 0.85)}
        icon={<FiActivity className="h-4 w-4 text-green-500" />}
      />
      <StatCard
        link="/mainmarketbidreports"
        title="Total Bid Amount"
        value={`₹${stats?.totalBidAmount?.toLocaleString()}`}
        change={calculateChange(stats.totalBidAmount, stats.totalBidAmount * 0.88)}
        icon={<FiTrendingUp className="h-4 w-4 text-purple-500" />}
      />
      <StatCard
        link="/withdrawal"
        title="Net Profit"
        value={`₹${stats?.netFlow?.toLocaleString()}`}
        change={calculateChange(stats.netFlow, stats.netFlow * 0.92)}
        icon={<FiDollarSign className="h-4 w-4 text-yellow-500" />}
        negative={stats.netFlow < 0}
      />

      <StatCard
        link="/funds"
        title="Today Deposits"
        value={`₹${todayStats?.deposits?.toLocaleString()}`}
        change={calculateChange(todayStats.deposits, todayStats.deposits * 0.9)}
        icon={<FiDollarSign className="h-4 w-4 text-green-500" />}
      />
      <StatCard
        link="/withdrawal"
        title="Today Withdrawal"
        value={`₹${todayStats?.withdrawals?.toLocaleString()}`}
        change={calculateChange(todayStats.withdrawals, todayStats.withdrawals * 0.9)}
        icon={<FiDollarSign className="h-4 w-4 text-red-500" />}
      />

      <StatCard
        link=""
        title="Today Bid"
        value={`${todayStats?.totalbid?.toLocaleString()}`}
        change={calculateChange(todayStats.totalbid, todayStats.totalbid * 0.9)}
        icon={<FiTrendingUp className="h-4 w-4 text-blue-500" />}
      />

      <StatCard
        link=""
        title="Today Profit/Loss"
        value={`₹${Math.abs(todayStats?.profitLoss)?.toLocaleString()}`}
        change={calculateChange(todayStats.profitLoss, todayStats.profitLoss * 0.9)}
        icon={<FiDollarSign className="h-4 w-4 text-yellow-500" />}
        negative={todayStats.profitLoss < 0}
      />
    </div>
  )
}

export default DashboardCard