"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  FiActivity,
  FiDollarSign,
  FiUserPlus,
  FiTrendingUp,
  FiArrowUp,
  FiArrowDown,
  FiLogOut,
  FiRefreshCw,
  FiUsers,
  FiBarChart2
} from "react-icons/fi";

import { useAppDispatch } from "@/hooks/redux";
import { logoutUser } from "@/redux/slices/authSlice";
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

interface TodayData {
  deposits: number;
  withdrawals: number;
  profitLoss: number;
  totalbid: number
}



export default function Dashboard() {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<DashboardData | null>(null);
  const [todatData, setTodayData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');
  const [activeChart, setActiveChart] = useState('revenue');

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

  useEffect(() => {
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/today-financial-summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.data.status) {
        console.log(response.data.data)
        setTodayData(response.data.data);
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

  // Calculate percentage changes (you would typically get this from your API)
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return '+100%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return <DashboardSkeleton />;
  }

  const { stats, charts, recentActivity } = data;

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
      <DashboardCard stats={stats} todatData={todatData} calculateChange={calculateChange} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Charts */}
        <RevenueChart activeChart={activeChart} setActiveChart={setActiveChart} charts={charts} />

        {/* Activity */}
        <RecentActivity recentActivity={recentActivity} />
      </div>
    </div>
  );
}

