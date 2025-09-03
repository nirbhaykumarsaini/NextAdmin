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
  FiEye
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAppDispatch } from "@/hooks/redux";
import { logoutUser } from "@/redux/slices/authSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalBidAmount: number;
    totalDeposits: number;
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


interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  amount: number;
  type: 'credit' | 'debit';
  description?: string;
  status: string;
  createdAt: string;
  formattedTime: string;
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');
  const [transactions, setTransactions] = useState<Transaction[]>([]);


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
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      const response = await axios.get(`/api/transactions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.data.status) {
        setTransactions(response.data.data.transactions.slice(0, 3)); // Show only the latest 5 transactions
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTransactions();
  }, [])

  console.log('Transactions:', transactions);

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
            Here&apos;s what&apos;s happening with your platform today.
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
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change="+12.5%"
          icon={<FiUserPlus className="h-4 w-4 text-green-500" />}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          change="+8.2%"
          icon={<FiActivity className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Total Bid Amount"
          value={`₹${stats.totalBidAmount.toLocaleString()}`}
          change="+15.3%"
          icon={<FiTrendingUp className="h-4 w-4 text-purple-500" />}
        />
        <StatCard
          title="Total Deposits"
          value={`₹${stats.totalDeposits.toLocaleString()}`}
          change="+10.1%"
          icon={<FiDollarSign className="h-4 w-4 text-yellow-500" />}
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
              <Tabs defaultValue="revenue" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
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
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow)'
                      }}
                      formatter={(value) => [`₹${value}`, 'Amount']}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FiActivity className="h-5 w-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchTransactions}
                  className="h-8 w-8 p-0"
                >
                  <FiActivity className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-muted-foreground mb-2">No recent activity</div>
                  <p className="text-sm text-gray-500">Transactions will appear here</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center gap-3 group  dark:hover:bg-gray-750 p-2 rounded-lg transition-colors">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 text-sm font-medium">
                        {transaction.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">
                          {transaction.userName}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs px-2 py-0.5 ${transaction.type === 'credit'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                        >
                          {transaction.type === 'credit' ? (
                            <FiArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <FiArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {transaction.type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${transaction.type === 'credit'
                            ? 'text-green-600'
                            : 'text-red-600'
                          }`}>
                          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground truncate">
                          {transaction.formattedTime}
                        </p>
                      </div>

                      {transaction.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {transaction.description}
                        </p>
                      )}
                    </div>

                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 text-xs whitespace-nowrap"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                ))
              )}

              {/* {transactions.length > 0 && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => window.location.href = '/transactions'}
                  >
                    <FiEye className="h-3 w-3 mr-1" />
                    View all transactions
                  </Button>
                </div>
              )} */}
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
              {Array.from({ length: 5 }).map((_, i) => (
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

function StatCard({
  title,
  value,
  change,
  icon,
  negative = false
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  negative?: boolean;
}) {
  return (
    <Card className="bg-white dark:bg-gray-800">
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
          <p className={`text-xs mt-1 flex items-center ${negative ? 'text-red-500' : 'text-green-500'
            }`}>
            {change}
            {negative ? (
              <FiArrowDown className="h-3 w-3 ml-1" />
            ) : (
              <FiArrowUp className="h-3 w-3 ml-1" />
            )}
          </p>
        </div>
        <FiArrowRight className="h-5 w-5 ml-1 cursor-pointer" />
      </CardContent>
    </Card>
  );
}