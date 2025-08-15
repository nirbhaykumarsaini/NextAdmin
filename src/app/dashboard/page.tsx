"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FiActivity,
  FiDollarSign,
  FiUserPlus,
  FiTrendingUp,
  FiArrowUp,
  FiArrowDown,
  FiLogOut
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

const revenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
];

const activityData = [
  { id: 1, user: 'U1', action: 'made a deposit', time: '1 hour ago' },
  { id: 2, user: 'U2', action: 'placed a bid', time: '2 hours ago' },
  { id: 3, user: 'U3', action: 'withdrew funds', time: '3 hours ago' },
  { id: 4, user: 'U4', action: 'registered', time: '4 hours ago' },
  { id: 5, user: 'U5', action: 'won a game', time: '5 hours ago' },
];

export default function Dashboard() {

  return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome back, {'Admin'}!
            </h2>
            <p className="text-muted-foreground">
              Here's what's happening with your account today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Last 7 days" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900">
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <FiLogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value="$24,780" 
          change="+12.5%" 
          icon={<FiDollarSign className="h-4 w-4 text-blue-500" />}
        />
        <StatCard 
          title="Active Users" 
          value="1,429" 
          change="+8.2%" 
          icon={<FiUserPlus className="h-4 w-4 text-green-500" />}
        />
        <StatCard 
          title="Conversion Rate" 
          value="3.42%" 
          change="-0.8%" 
          icon={<FiTrendingUp className="h-4 w-4 text-purple-500" />}
          negative
        />
        <StatCard 
          title="Avg. Session" 
          value="4m 32s" 
          change="+1.3%" 
          icon={<FiActivity className="h-4 w-4 text-orange-500" />}
        />
      </div>
      
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
                  <BarChart data={revenueData}>
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
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {activityData.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{item.user}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      User {item.user} {item.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
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
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs mt-1 flex items-center ${
          negative ? 'text-red-500' : 'text-green-500'
        }`}>
          {change}
          {negative ? (
            <FiArrowDown className="h-3 w-3 ml-1" />
          ) : (
            <FiArrowUp className="h-3 w-3 ml-1" />
          )}
        </p>
      </CardContent>
    </Card>
  );
}