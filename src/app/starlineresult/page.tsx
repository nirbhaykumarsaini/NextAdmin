"use client"

import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
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
import { FiCalendar, FiTrash2 } from 'react-icons/fi'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchGames } from '@/redux/slices/starlineSlice'
import { toast } from 'sonner'
import { IStarlineGame } from '@/models/StarlineGame'

interface Panna {
    _id: string;
    digit: string;
}

interface Winner {
    amount: number;
    created_at: string;
    digit: number;
    game: number;
    game_type: string;
    user: string;
    winning_amount: number
}

interface GroupedResult {
    _id: string;
    result_date: string;
    game_name: string;
    panna: string;
    digit: string;
}

const StarlineResult = () => {
    const [result_date, setDate] = useState<Date | undefined>(new Date())
    const [game_id, setGameName] = useState("")
    const [panna, setPanna] = useState("")
    const [digit, setDigit] = useState("")
    const [results, setResults] = useState<GroupedResult[]>([])
    const [showWinnerDialog, setShowWinnerDialog] = useState(false)
    const [winners, setWinners] = useState<Winner[]>([])
    const [totalBidAmount, setTotalBidAmount] = useState(0)
    const [totalWinningAmount, setTotalWinningAmount] = useState(0)
    const [searchPanna, setSearchPanna] = useState("")
    const [filteredPanna, setFilteredPanna] = useState<Panna[]>([])
    const [showDropdown, setShowDropdown] = useState(false)

    const dispatch = useAppDispatch();
    const { games } = useAppSelector(
        (state) => state.starline
    );

    const [allPanna, setAllPanna] = useState<Panna[] | null>(null)

    useEffect(() => {
        dispatch(fetchGames({}));
        fetchAllPanna();
        fetchResultsByDate(); // Fetch results for current date on initial load
    }, [dispatch]);

    useEffect(() => {
        // Fetch results whenever date changes
        fetchResultsByDate();
    }, [result_date]);

    useEffect(() => {
        if (allPanna && searchPanna) {
            const filtered = allPanna.filter(pannaItem =>
                pannaItem.digit.includes(searchPanna)
            );
            setFilteredPanna(filtered);
            setShowDropdown(true);
        } else {
            setFilteredPanna([]);
            setShowDropdown(false);
        }
    }, [searchPanna, allPanna]);

    const fetchAllPanna = async () => {
        try {
            const response = await fetch('/api/panna/all');
            const result = await response.json();

            if (result.status === false) {
                toast.error(result.message || "Failed to fetch panna data")
            } else {
                setAllPanna(result.data);
            }
        } catch (error) {
            console.error('Error fetching panna data:', error);
            toast.error('Failed to fetch panna data')
        }
    };

    // ✅ NEW: Fetch results by specific date for Starline
    const fetchResultsByDate = async () => {
        try {
            if (!result_date) return;

            const formattedDate = format(result_date, "dd-MM-yyyy");
            
            const response = await fetch('/api/result-by-date/starline', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    result_date: formattedDate
                }),
            });

            const result = await response.json();
            console.log('Starline results by date:', result);

            if (result.status) {
                setResults(result.data);
            } else {
                // If no results found for the date, set empty array
                setResults([]);
                // Only show error if it's not a "no results" scenario
                if (!result.message.includes('No results') && !result.message.includes('no result')) {
                    toast.error(result.message || "Failed to fetch results");
                }
            }
        } catch (error) {
            console.error('Error fetching starline results by date:', error);
            toast.error('Failed to fetch results');
            setResults([]); // Set empty array on error
        }
    };

    // ✅ OLD: Keep this function if you still need to fetch all results somewhere
    const fetchAllResults = async () => {
        try {
            const response = await fetch('/api/starline/results');
            const result = await response.json();

            if (result.status) {
                setResults(result.data);
            } else {
                toast.error(result.message || "Failed to fetch results")
            }
        } catch (error) {
            console.error('Error fetching results:', error);
            toast.error('Failed to fetch results')
        }
    };

    const handlePannaSearch = (value: string) => {
        setSearchPanna(value);

        // If input is empty, clear both panna and digit
        if (!value.trim()) {
            setPanna("");
            setDigit("");
            setFilteredPanna([]);
            setShowDropdown(false);
            return;
        }

        // Auto-calculate digit as user types (only if it's a valid 3-digit number)
        if (/^\d{3}$/.test(value)) {
            calculateDigit(value);
        } else {
            setDigit("");
        }
    };

    const calculateDigit = (pannaValue: string) => {
        const digits = pannaValue.split('').map(Number);
        let sum = digits.reduce((total, digit) => total + digit, 0);

        // If sum is greater than 9, take the last digit
        if (sum > 9) {
            sum = Number(sum.toString().slice(-1));
        }

        setDigit(sum.toString());
    };

    const handlePannaSelect = (selectedPanna: string) => {
        setPanna(selectedPanna);
        setSearchPanna(selectedPanna);
        setShowDropdown(false);
        calculateDigit(selectedPanna);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate panna
        if (!panna || panna.length !== 3) {
            toast.error("Please enter a valid 3-digit panna");
            return;
        }

        try {
            const formattedDate = result_date ? format(result_date, "dd-MM-yyyy") : "";

            // First, show winners
            const winnersResponse = await fetch('/api/starline/winners', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    result_date: formattedDate,
                    game_id,
                    panna,
                    digit
                }),
            });

            const winnersResult = await winnersResponse.json();

            if (winnersResult.status) {
                setWinners(winnersResult.data.winners);
                setTotalBidAmount(winnersResult.data.total_bid_amount);
                setTotalWinningAmount(winnersResult.data.total_win_amount);
                setShowWinnerDialog(true);
            } else {
                toast.error(winnersResult.message || "Failed to fetch winners");
            }

        } catch (error) {
            console.error('Error showing winners:', error);
            toast.error('Failed to show winners');
        }
    };

    const handleDeclareResult = async () => {
        try {
            const formattedDate = result_date ? format(result_date, "dd-MM-yyyy") : "";
            // Save the result
            const saveResponse = await fetch('/api/starline/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    result_date: formattedDate,
                    game_id,
                    panna,
                    digit,
                    winners
                }),
            });

            const saveResult = await saveResponse.json();

            if (saveResult.status) {
                toast.success("Result saved successfully");
                setShowWinnerDialog(false);

                // Reset form
                setDate(new Date());
                setGameName("");
                setPanna("");
                setDigit("");
                setSearchPanna("");

                // Refresh results for the current date
                fetchResultsByDate();
                fetchAllPanna();
            } else {
                toast.error(saveResult.message || "Failed to save result");
            }

        } catch (error) {
            console.error('Error declaring result:', error);
            toast.error('Failed to declare result');
        }
    };

    const handleDeleteResult = async (resultId: string) => {
        if (!resultId) {
            toast.error("Invalid result ID");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete this result?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/starline/results?id=${resultId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.status) {
                toast.success("Result deleted successfully");
                // Refresh results for the current date
                fetchResultsByDate();
                fetchAllPanna();
            } else {
                toast.error(result.message || "Failed to delete result");
            }
        } catch (error) {
            console.error('Error deleting result:', error);
            toast.error('Failed to delete result');
        }
    };

    // Filter games that have results declared for the selected date
    const getAvailableGames = () => {
        const formattedDate = result_date ? format(result_date, "dd-MM-yyyy") : "";

        const gameOptions = games.map((game: IStarlineGame) => ({
            _id: game._id,
            name: game.game_name
        }));

        // Filter out games that already have results for the selected date
        return gameOptions.filter(game => {
            const gameResults = results?.find(r => 
                r?.game_name === game?.name && 
                r?.result_date === formattedDate
            );
            // Only show games that don't have declared result for this date
            return !gameResults;
        });
    };

    const availableGames = getAvailableGames();

    return (
        <div className="container mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-center">Starline Results</h1>

            {/* Result Form */}
            <div className="ite rounded-lg shadow-md ">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Date Picker */}
                    <div className="space-y-2">
                        <Label>Result Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <FiCalendar className="mr-2 h-4 w-4" />
                                    {result_date ? format(result_date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                                <Calendar
                                    mode="single"
                                    selected={result_date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Game Name Select */}
                    <div className="space-y-2">
                        <Label>Game Name</Label>
                        <Select onValueChange={setGameName} value={game_id}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Select Game" />
                            </SelectTrigger>
                            <SelectContent className='bg-white dark:bg-gray-900'>
                                {availableGames.map((game) => (
                                    <SelectItem key={game._id} value={game._id}>
                                        {game.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Panna Search Input */}
                    <div className="space-y-2 relative">
                        <Label>Panna</Label>
                        <Input
                            type="text"
                            placeholder="Search panna..."
                            value={searchPanna}
                            onChange={(e) => handlePannaSearch(e.target.value)}
                            className="w-full"
                            maxLength={3}
                            onFocus={() => {
                                if (searchPanna && allPanna) {
                                    const filtered = allPanna.filter(pannaItem =>
                                        pannaItem.digit.includes(searchPanna)
                                    );
                                    setFilteredPanna(filtered);
                                    setShowDropdown(true);
                                }
                            }}
                            onBlur={() => {
                                // Delay hiding dropdown to allow for click
                                setTimeout(() => setShowDropdown(false), 200);
                            }}
                        />
                        {/* Dropdown for filtered panna results */}
                        {showDropdown && filteredPanna.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {filteredPanna.map((pannaItem) => (
                                    <div
                                        key={pannaItem._id}
                                        className="px-4 py-1.5 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                                        onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                                        onClick={() => handlePannaSelect(pannaItem.digit)}
                                    >
                                        {pannaItem.digit}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Digit Input */}
                    <div className="space-y-2">
                        <Label>Digit (Auto-calculated)</Label>
                        <Input
                            type="text"
                            placeholder="Digit"
                            value={digit}
                            readOnly
                            className="bg-gray-100"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-center mt-5">
                        <Button type="submit" className="w-full ">
                            Show Winner
                        </Button>
                    </div>
                </form>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Select Date to View Results</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className="w-fit justify-start text-left font-normal"
                            >
                                <FiCalendar className="mr-2 h-4 w-4" />
                                {result_date ? format(result_date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                            <Calendar
                                mode="single"
                                selected={result_date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                
                {/* Results Table */}
                <div className="rounded-lg border shadow-md overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>S. No.</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Game Name</TableHead>
                                <TableHead>Result</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results?.length > 0 ? (
                                results?.map((result, index) => (
                                    <TableRow key={`${result?.result_date}-${result?.game_name}`}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{result?.result_date}</TableCell>
                                        <TableCell>{result?.game_name}</TableCell>
                                        <TableCell>
                                            {result?.panna && result?.digit ? (
                                                <div className="flex items-center gap-2">
                                                    <span>{result?.panna} - {result?.digit}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Not declared</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-600 hover:text-red-800 hover:bg-red-100"
                                                onClick={() => handleDeleteResult(result?._id || '')}
                                            >
                                                <FiTrash2 size={16} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">
                                        No results found for selected date
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Winner Dialog */}
            <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
                <DialogContent className="sm:max-w-4xl bg-white dark:bg-gray-950">
                    <DialogHeader>
                        <DialogTitle>Winners - {game_id}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center rounded-lg">
                            <div>
                                <p className="font-medium">Panna: {panna} | Digit: {digit}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border">
                                <p className="text-xs">Total Bid Amount</p>
                                <p className="text-xl font-bold">₹{totalBidAmount}</p>
                            </div>
                            <div className="p-4 rounded-lg border">
                                <p className="text-xs">Total Winning Amount</p>
                                <p className="text-xl font-bold">₹{totalWinningAmount}</p>
                            </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>S. No.</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Game Name</TableHead>
                                        <TableHead>Game Type</TableHead>
                                        <TableHead>Bid Amount</TableHead>
                                        <TableHead>Winning Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {winners?.length > 0 ? (
                                        winners.map((winner, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{winner?.created_at}</TableCell>
                                                <TableCell>{winner?.user}</TableCell>
                                                <TableCell>{winner?.game}</TableCell>
                                                <TableCell>{winner?.game_type}</TableCell>
                                                <TableCell>{winner?.amount}</TableCell>
                                                <TableCell>{winner?.winning_amount}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-4">
                                                No winning bids found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" onClick={() => setShowWinnerDialog(false)}>
                                Close
                            </Button>
                            <Button onClick={handleDeclareResult}>
                                Declare Result
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default StarlineResult