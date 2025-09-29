import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FiBarChart2, FiRefreshCw } from 'react-icons/fi'
import { Button } from '../ui/button'

interface RevenueChartProps {
    activeChart: string
    setActiveChart: (value: string) => void
    charts: {
        revenue: Array<{ name: string; value: number }>
    },
    fetchDashboardData: () => void;
}

const RevenueChart = ({ activeChart, setActiveChart, fetchDashboardData, charts }: RevenueChartProps) => {
    const hasRevenueData = charts.revenue && charts.revenue.length > 0

    return (
        <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue Overview</CardTitle>
                    <Tabs value={activeChart} onValueChange={setActiveChart} className="space-y-4">
                        <TabsList className="bg-white dark:bg-gray-800">
                            <TabsTrigger value="revenue">Revenue</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="pl-6">
                    <div className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            {hasRevenueData ? (
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
                                <div className="flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 h-full w-full">
                                    <svg
                                        className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 17v-6h6v6m2 0v-8H7v8m-2 0h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <h3 className="text-lg font-semibold mb-2">No Revenue Data</h3>
                                    <p className="text-center text-sm mb-1">
                                        We couldn’t find any revenue records for this period. Once you have sales data, it will appear here.
                                    </p>
                                    <p className="text-center text-sm ">
                                       Please try again later
                                    </p>
                                </div>

                            )}
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default RevenueChart
