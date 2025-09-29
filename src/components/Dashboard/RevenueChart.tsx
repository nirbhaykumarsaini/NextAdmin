


import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface RevenueChartProps {
    activeChart: string;
    setActiveChart: (value: string) => void;
    charts: {
        userGrowth: Array<{ name: string; value: number }>;
        revenue: Array<{ name: string; value: number }>;
    };
}


const RevenueChart = ({ activeChart, setActiveChart, charts }: RevenueChartProps) => {
    return (
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
    )
}

export default RevenueChart