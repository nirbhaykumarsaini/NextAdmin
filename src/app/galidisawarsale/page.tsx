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
import { fetchGames } from '@/redux/slices/galidisawarSlice'

interface SaleReportItem {
    digit: string;
    point: number;
}

interface SaleReport {
    status: boolean;
    message?: string;
    leftDigitBid?: SaleReportItem[];
    rightDigitBid?: SaleReportItem[];
    jodiDigitBid?: SaleReportItem[];
}

interface ReportSection {
    key: string;
    title: string;
    data: SaleReportItem[];
    totalPoints: number;
    totalItems: number;
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
    const [reportSections, setReportSections] = useState<ReportSection[]>([]);

    const dispatch = useAppDispatch();
    const { games } = useAppSelector(state => state.galidisawar);

    useEffect(() => {
        dispatch(fetchGames({}))
    }, [dispatch])

    // Process sale report data into sections when saleReport changes
    useEffect(() => {
        if (saleReport) {
            const sections: ReportSection[] = [];

            // Define all possible report sections with their keys and titles
            const sectionConfigs = [
                { key: 'leftDigitBid', title: 'Left Digit' },
                { key: 'rightDigitBid', title: 'Right Digit' },
                { key: 'jodiDigitBid', title: 'Jodi Digit' },
            ];

            sectionConfigs.forEach(config => {
                const data = saleReport[config.key as keyof SaleReport] as SaleReportItem[];
                if (data && data.length > 0) {
                    const totalPoints = data.reduce((sum, item) => sum + (item.point || 0), 0);
                    sections.push({
                        key: config.key,
                        title: config.title,
                        data,
                        totalPoints,
                        totalItems: data.length
                    });
                }
            });

            setReportSections(sections);
        }
    }, [saleReport]);

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

            const response = await fetch('/api/galidisawar/sale', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bid_date: formattedDate,
                    game_id: gameId === "all" ? undefined : gameId || undefined,
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
        return game ? game.game_name : 'All';
    };

    const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    };


    const renderHorizontalTable = (reportItems: SaleReportItem[], title: string, key: string) => {
        if (!reportItems || reportItems.length === 0) return null;

        const totalPoints = reportItems.reduce((sum, item) => sum + (item.point || 0), 0);

        // Split data into chunks of 10 items per row
        const chunkSize = 10;
        const dataChunks = chunkArray(reportItems, chunkSize);

        return (
            <div className="space-y-4 mb-8" key={key}>
                <div className="flex justify-center items-center gap-3">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <div className="text-sm text-muted-foreground">
                        Total: {totalPoints.toLocaleString()} points
                    </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableBody>
                            {dataChunks.map((chunk, chunkIndex) => (
                                <React.Fragment key={`chunk-${key}-${chunkIndex}`}>
                                    {/* Digit Row */}
                                    <TableRow className="bg-muted/50">
                                        <TableCell className="font-semibold text-center min-w-[80px] border-r">
                                            Digit
                                        </TableCell>
                                        {chunk.map((item, index) => (
                                            <TableCell key={`digit-${key}-${chunkIndex}-${index}`} className="text-center font-medium min-w-[80px]">
                                                {item.digit}
                                            </TableCell>
                                        ))}
                                        {/* Fill remaining cells if last chunk has fewer items */}
                                        {chunkIndex === dataChunks.length - 1 &&
                                            chunk.length < chunkSize &&
                                            Array.from({ length: chunkSize - chunk.length }).map((_, index) => (
                                                <TableCell key={`empty-digit-${key}-${chunkIndex}-${index}`} className="text-center min-w-[80px]">
                                                    -
                                                </TableCell>
                                            ))
                                        }
                                    </TableRow>
                                    {/* Amount Row */}
                                    <TableRow>
                                        <TableCell className="font-semibold text-center min-w-[80px] border-r">
                                            Amount
                                        </TableCell>
                                        {chunk.map((item, index) => (
                                           <TableCell key={`amount-${index}`} className="text-center min-w-[80px] p">
                                                <span className={item.point > 0 ? 'text-green-700 bg-green-50 font-semibold p-1 rounded-sm' : 'text-red-700 font-semibold bg-red-50 p-1 rounded-sm'}>{item.point.toLocaleString()}</span>
                                            </TableCell>
                                        ))}
                                        {/* Fill remaining cells if last chunk has fewer items */}
                                        {chunkIndex === dataChunks.length - 1 &&
                                            chunk.length < chunkSize &&
                                            Array.from({ length: chunkSize - chunk.length }).map((_, index) => (
                                                <TableCell key={`empty-amount-${key}-${chunkIndex}-${index}`} className="text-center min-w-[80px]">
                                                    -
                                                </TableCell>
                                            ))
                                        }
                                    </TableRow>
                                    {/* Add spacing between chunks */}
                                    {chunkIndex < dataChunks.length - 1 && (
                                        <TableRow key={`spacer-${key}-${chunkIndex}`}>
                                            <TableCell colSpan={chunkSize + 1} className="p-2 bg-transparent"></TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    };

    const renderAllTables = () => {
        if (!reportSections || reportSections.length === 0) return null;

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Complete Sale Report</h3>
                    <div className="text-sm text-muted-foreground">
                        Total Sections: {reportSections.length}
                    </div>
                </div>

                {reportSections.map(section =>
                    renderHorizontalTable(section.data, section.title, section.key)
                )}
            </div>
        );
    };

    const calculateOverallTotals = () => {
        const totalItems = reportSections.reduce((sum, section) => sum + section.totalItems, 0);
        const totalPoints = reportSections.reduce((sum, section) => sum + section.totalPoints, 0);
        return { totalItems, totalPoints };
    };

    const { totalItems, totalPoints } = calculateOverallTotals();

    return (
        <div className="container mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-center">Galidisawar Sale Report</h1>

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
                                    className="w-full justify-start text-left text-xs font-normal"
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
                                <SelectItem className='text-xs' key="all" value="all">
                                    All
                                </SelectItem>
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
                    <div className="text-center text-sm text-red-400 rounded">
                        {error}
                    </div>
                )}
            </div>

            {/* Sale Report Results */}
            {saleReport && reportSections.length > 0 && (
                <div className="rounded-lg border shadow-md p-6">
                    {/* Report Summary Cards */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Report Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                            {/* Total Items Card */}
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
                                            {totalItems.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Total Points Card */}
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
                                            {totalPoints.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* All Tables Display */}
                    {renderAllTables()}
                </div>
            )}
        </div>
    )
}

export default MainMarketSale