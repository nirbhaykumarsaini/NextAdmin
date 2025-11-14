"use client";

import { useAppDispatch } from "@/hooks/redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import DashboardSkeleton from "@/components/Dashboard/DashboardSkeleton";
import DashboardTitle from "@/components/Dashboard/DashboardTitle";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import RevenueChart from "@/components/Dashboard/RevenueChart";
import RecentActivity from "@/components/Dashboard/RecentActivity";

interface DashboardData {
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
  charts: {
    userGrowth: Array<{ name: string; value: number }>;
    revenue: Array<{ name: string; value: number }>;
  };
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    amount: number;
    time: string;
  }>;
  timeRange: {
    days: number;
  };
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1'); // Default to Today

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/dashboard?days=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.data.status) {
        setData(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch dashboard data:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return <DashboardSkeleton />;
  }

  const { stats, todayStats, charts, recentActivity } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <DashboardTitle
        dispatch={dispatch}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        fetchDashboardData={fetchDashboardData}
      />

      {/* Stats Grid */}
      <DashboardCard 
        stats={stats} 
        todayStats={todayStats} 
        calculateChange={calculateChange} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Charts */}
        <RevenueChart 
          activeChart={'revenue'} 
          fetchDashboardData={fetchDashboardData} 
          setActiveChart={() => {}} 
          charts={charts} 
        />

        {/* Activity */}
        <RecentActivity recentActivity={recentActivity} />
      </div>
    </div>
  );
}