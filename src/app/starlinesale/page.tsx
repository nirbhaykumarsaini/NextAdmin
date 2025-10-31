"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { FiCalendar, FiLoader } from 'react-icons/fi'
import { Label } from '@/components/ui/label'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchGames } from '@/redux/slices/starlineSlice'

interface SaleReportItem {
    digit: string;
    point: number;
}

interface SaleReport {
    status: boolean;
    message?: string;
    singleDigitBid?: SaleReportItem[];
    singlePannaBid?: SaleReportItem[];
    doublePannaBid?: SaleReportItem[];
    triplePannaBid?: SaleReportItem[];
}

const gameTypes = [
    { value: "all", label: "All" },
    { value: "single-digit", label: "Single Digit" },
    { value: "single-panna", label: "Single Panna" },
    { value: "double-panna", label: "Double Panna" },
    { value: "triple-panna", label: "Triple Panna" },

];

const MainMarketSale = () => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [gameId, setGameId] = useState("")
    const [gameType, setGameType] = useState("")
    const [loading, setLoading] = useState(false);
    const [saleReport, setSaleReport] = useState<SaleReport | null>(null);
    const [error, setError] = useState("");

    const dispatch = useAppDispatch();
    const { games } = useAppSelector(state => state.starline);

    useEffect(() => {
        dispatch(fetchGames({}))
    }, [dispatch])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!gameType) {
            setError("Please select a game type");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';

            const response = await fetch('/api/starline/sale', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bid_date: formattedDate,
                    game_id: gameId || undefined,
                    game_type: gameType,
                }),
            });

            const data: SaleReport = await response.json();

            if (data.status) {
                setSaleReport(data);
            } else {
                setError(data.message || 'Failed to fetch sale report');
            }
        } catch (err) {
            setError('Failed to fetch sale report. Please try again.');
            console.error('Error fetching sale report:', err);
        } finally {
            setLoading(false);
        }
    };

    const getGameTypeLabel = (value: string) => {
        return gameTypes.find(gt => gt.value === value)?.label || value;
    };

    const getGameName = (id: string) => {
        const game = games.find(g => g._id === id);
        return game ? game.game_name : 'Unknown Game';
    };

    const renderSaleReportTable = (reportItems: SaleReportItem[] | undefined, title: string) => {
        if (!reportItems || reportItems.length === 0) return null;

        return (
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Digit/Panna</TableHead>
                                <TableHead>Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportItems.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.digit}</TableCell>
                                    <TableCell>{item.point}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-center">Starline Sale Report</h1>

            {/* Sale Report Form */}
            <div className="rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Date Picker */}
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className="w-full justify-start text-left font-normal text-xs"
                                >
                                    <FiCalendar className="mr-2 h-4 w-4" />
                                    {date ? format(date, "MMM dd, yyyy") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Game Name Select */}
                    <div className="space-y-2">
                        <Label>Game Name </Label>
                        <Select onValueChange={setGameId} value={gameId}>
                            <SelectTrigger className='w-full text-xs'>
                                <SelectValue placeholder="Select Game" />
                            </SelectTrigger>
                            <SelectContent className='bg-white dark:bg-gray-900'>
                                {games.map((game) => (
                                    <SelectItem className='text-xs' key={game._id} value={game._id}>
                                        {game.game_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Game Type Select */}
                    <div className="space-y-2">
                        <Label>Game Type *</Label>
                        <Select onValueChange={setGameType} value={gameType}>
                            <SelectTrigger className='w-full text-xs'>
                                <SelectValue placeholder="Select Game Type" />
                            </SelectTrigger>
                            <SelectContent className='bg-white dark:bg-gray-900'>
                                {gameTypes.map((gametype) => (
                                    <SelectItem className='text-xs' key={gametype.value} value={gametype.value}>
                                        {gametype.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center mt-3">
                        <Button
                            type="submit"
                            className="w-full text-xs"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="animate-spin mr-2" />
                                    Loading...
                                </>
                            ) : (
                                'Generate Report'
                            )}
                        </Button>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
            </div>

            {/* Sale Report Results */}
            {saleReport && (
                <div className="rounded-lg border shadow-md p-6">
                    {/* Display basic info about the report */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Report Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Date Card */}
                            <div className="rounded-lg border p-4 shadow-sm bg-white dark:bg-gray-800">
                                <div className="flex items-center space-x-2">
                                    <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
                                        <FiCalendar className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Date</p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {date ? format(date, 'PPP') : 'All dates'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Game Card */}
                            <div className="rounded-lg border p-4 shadow-sm bg-white dark:bg-gray-800">
                                <div className="flex items-center space-x-2">
                                    <div className="flex-shrink-0 rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                                        <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Game</p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {gameId ? getGameName(gameId) : 'All games'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Game Type Card */}
                            <div className="rounded-lg border p-4 shadow-sm bg-white dark:bg-gray-800">
                                <div className="flex items-center space-x-2">
                                    <div className="flex-shrink-0 rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                                        <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Game Type</p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {getGameTypeLabel(gameType)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Total Items Card - Show total number of sale items if available */}
                            {saleReport && (
                                <div className="rounded-lg border p-4 shadow-sm bg-white dark:bg-gray-800">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-shrink-0 rounded-full bg-purple-100 p-2 dark:bg-purple-900/20">
                                            <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {Object.values(saleReport).reduce((total, report) => {
                                                    if (Array.isArray(report)) {
                                                        return total + report.length;
                                                    }
                                                    return total;
                                                }, 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Total Points Card - Show total points if available */}
                            {saleReport && (
                                <div className="rounded-lg border p-4 shadow-sm bg-white dark:bg-gray-800">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-shrink-0 rounded-full bg-amber-100 p-2 dark:bg-amber-900/20">
                                            <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {Object.values(saleReport).reduce((total, report) => {
                                                    if (Array.isArray(report)) {
                                                        return total + report.reduce((sum, item) => sum + (item.point || 0), 0);
                                                    }
                                                    return total;
                                                }, 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Render all available report sections */}
                    {saleReport.singleDigitBid && renderSaleReportTable(saleReport.singleDigitBid, 'Single Digit')}
                    {saleReport.singlePannaBid && renderSaleReportTable(saleReport.singlePannaBid, 'Single Panna')}
                    {saleReport.doublePannaBid && renderSaleReportTable(saleReport.doublePannaBid, 'Double Panna')}
                    {saleReport.triplePannaBid && renderSaleReportTable(saleReport.triplePannaBid, 'Triple Panna')}
                </div>
            )}
        </div>
    )
}

export default MainMarketSale