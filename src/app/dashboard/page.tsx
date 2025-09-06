"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  FiArrowRight,
  FiRefreshCw,
  FiUsers,
  FiBarChart2
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useAppDispatch } from "@/hooks/redux";
import { logoutUser } from "@/redux/slices/authSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Url } from "next/dist/shared/lib/router/router";

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

interface StatCardProps {
  title: string;
  link: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  negative?: boolean;
}

function StatCard({ title, value, change, link, icon, negative = false }: StatCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">
          {title}
        </p>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="flex justify-between items-end">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <p className={`text-xs mt-1 flex items-center ${negative ? 'text-red-500' : 'text-green-500'}`}>
            {change}
            {negative ? (
              <FiArrowDown className="h-3 w-3 ml-1" />
            ) : (
              <FiArrowUp className="h-3 w-3 ml-1" />
            )}
          </p>
        </div>
        <Link href={link}>
          <FiArrowRight className="h-5 w-5 ml-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');
  const [activeChart, setActiveChart] = useState('revenue');
  const router = useRouter();

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load dashboard data</p>
          <Button onClick={fetchDashboardData}>
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { stats, charts, recentActivity } = data;



  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, Admin!
          </h2>
          <p className="text-muted-foreground">
            Here&lsquo;s what&lsquo;s happening with your platform today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Last 7 days" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchDashboardData}>
            <FiRefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => dispatch(logoutUser())}>
            <FiLogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          link="/users/manage"
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={calculateChange(stats.totalUsers, stats.totalUsers * 0.9)} // Example calculation
          icon={<FiUsers className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Active Users"
          link="/users/manage"
          value={stats.activeUsers.toLocaleString()}
          change={calculateChange(stats.activeUsers, stats.activeUsers * 0.85)} // Example calculation
          icon={<FiActivity className="h-4 w-4 text-green-500" />}
        />
        <StatCard
          link="/mainmarketbidreports"
          title="Total Bid Amount"
          value={`₹${stats.totalBidAmount.toLocaleString()}`}
          change={calculateChange(stats.totalBidAmount, stats.totalBidAmount * 0.88)} // Example calculation
          icon={<FiTrendingUp className="h-4 w-4 text-purple-500" />}
        />
        <StatCard
          link="/withdrawal"
          title="Net Profit"
          value={`₹${stats.netFlow.toLocaleString()}`}
          change={calculateChange(stats.netFlow, stats.netFlow * 0.92)} // Example calculation
          icon={<FiDollarSign className="h-4 w-4 text-yellow-500" />}
          negative={stats.netFlow < 0}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue Overview
              </CardTitle>
              <Tabs value={activeChart} onValueChange={setActiveChart} className="space-y-4">
                <TabsList className="bg-white dark:bg-gray-800">
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  {/* <TabsTrigger value="users">User Growth</TabsTrigger> */}
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChart === 'revenue' ? (
                    <BarChart data={charts.revenue}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--muted))"
                        strokeOpacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                          boxShadow: 'var(--shadow)',
                          color: 'hsl(var(--card-foreground))'
                        }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.0 }}
                        formatter={(value) => [`₹${value}`, 'Amount']}
                      />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        barSize={24}
                      />
                    </BarChart>
                  ) : (
                    <LineChart data={charts.userGrowth}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--muted))"
                        strokeOpacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                          boxShadow: 'var(--shadow)',
                          color: 'hsl(var(--card-foreground))'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiActivity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{item.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.user} {item.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ₹{item.amount} • {item.time}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
              <Button variant="ghost" className="w-full mt-2">
                View all activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}