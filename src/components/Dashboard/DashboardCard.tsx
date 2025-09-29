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
    },
    calculateChange: (current: number, previous: number) => string;
    todatData: TodayData | null
}

interface TodayData {
    deposits: number;
    withdrawals: number;
    profitLoss: number;
    totalbid: number
}

const DashboardCard = ({ stats, calculateChange, todatData }: DashboardCardProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                link="/users/manage"
                title="Total Users"
                value={stats?.totalUsers?.toLocaleString()}
                change={calculateChange(stats.totalUsers, stats.totalUsers * 0.9)} // Example calculation
                icon={<FiUsers className="h-4 w-4 text-blue-500" />}
            />
            <StatCard
                title="Active Users"
                link="/users/manage"
                value={stats?.activeUsers?.toLocaleString()}
                change={calculateChange(stats.activeUsers, stats.activeUsers * 0.85)} // Example calculation
                icon={<FiActivity className="h-4 w-4 text-green-500" />}
            />
            <StatCard
                link="/mainmarketbidreports"
                title="Total Bid Amount"
                value={`₹${stats?.totalBidAmount?.toLocaleString()}`}
                change={calculateChange(stats.totalBidAmount, stats.totalBidAmount * 0.88)} // Example calculation
                icon={<FiTrendingUp className="h-4 w-4 text-purple-500" />}
            />
            <StatCard
                link="/withdrawal"
                title="Net Profit"
                value={`₹${stats?.netFlow?.toLocaleString()}`}
                change={calculateChange(stats.netFlow, stats.netFlow * 0.92)} // Example calculation
                icon={<FiDollarSign className="h-4 w-4 text-yellow-500" />}
                negative={stats.netFlow < 0}
            />

            <StatCard
                link="/funds"
                title="Today Deposits"
                value={`₹${todatData?.deposits?.toLocaleString()}`}
                // change={calculateChange(stats.netFlow, stats.netFlow * 0.92)} // Example calculation
                icon={<FiDollarSign className="h-4 w-4 text-yellow-500" />}
            // negative={stats.netFlow < 0}
            />
            <StatCard
                link="/withdrawal"
                title="Today Withdrawal"
                value={`₹${todatData?.withdrawals?.toLocaleString()}`}
                // change={calculateChange(stats.netFlow, stats.netFlow * 0.92)} // Example calculation
                icon={<FiDollarSign className="h-4 w-4 text-yellow-500" />}
            // negative={stats.netFlow < 0}
            />

            <StatCard
                link=""
                title="Today Bid"
                value={`${todatData?.totalbid?.toLocaleString()}`}
                // change={calculateChange(stats.netFlow, stats.netFlow * 0.92)} // Example calculation
                icon={<FiDollarSign className="h-4 w-4 text-yellow-500" />}
            // negative={stats.netFlow < 0}
            />

            <StatCard
                link=""
                title="Today Profit/Loss"
                value={`₹${todatData?.profitLoss?.toLocaleString().replace('-', "")}`}
                // change={calculateChange(stats.netFlow, stats.netFlow * 0.92)} // Example calculation
                icon={<FiDollarSign className="h-4 w-4 text-yellow-500" />}
            // negative={stats.netFlow < 0}
            />
        </div>
    )
}

export default DashboardCard