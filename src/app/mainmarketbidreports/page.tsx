"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { FiSearch, FiRefreshCw } from 'react-icons/fi'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import MainBidTable from '@/components/BidTables/MainBidTable'
import { Input } from '@/components/ui/input'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchGames } from '@/redux/slices/mainMarketSlice'

export interface Bid {
    _id: string
    user_id: string
    name: string
    digit?: string
    panna?: string
    bid_amount: number
    game_id: string
    game_name: string
    game_type: string
    session?: string
    created_at: string
}

const gameTypes = [
    { value: "all", label: "All" },
    { value: "single-digit", label: "Single Digit" },
    { value: "jodi-digit", label: "Jodi Digit" },
    { value: "single-panna", label: "Single Panna" },
    { value: "double-panna", label: "Double Panna" },
    { value: "triple-panna", label: "Triple Panna" },
    { value: "sp-motor", label: "SP Motor" },
    { value: "dp-motor", label: "DP Motor" },
    { value: "sp-dp-tp-motor", label: "SP/DP/TP Motor" },
    { value: "half-sangam", label: "Half Sangam" },
    { value: "full-sangam", label: "Full Sangam" },
    { value: "odd-even", label: "Odd Even" },
    { value: "two-digit", label: "Two Digit" },
    { value: "digit-base-jodi", label: "Digit Base Jodi" },
    { value: "choice-panna", label: "Choice Panna" },
    { value: "red-bracket", label: "Red Bracket" },
]

const sessions = [
    { value: "all", label: "All Sessions" },
    { value: "open", label: "Open" },
    { value: "close", label: "Close" },
]

const MainMarketBidReports = () => {
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [gameId, setGameId] = useState("all")
    const [gameType, setGameType] = useState("all")
    const [session, setSession] = useState("all")
    const [userId, setUserId] = useState("")
    const [bids, setBids] = useState<Bid[]>([])
    const [loading, setLoading] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingBid, setEditingBid] = useState<Bid | null>(null);
    const [formData, setFormData] = useState({
        digit: '',
        panna: '',
        bid_amount: 0,
        game_id: '',
        game_type: '',
        session: '',
    });
    const [updating, setUpdating] = useState(false);

    const dispatch = useAppDispatch();
    const { games } = useAppSelector((state) => state.mainMarket);

    const fetchBids = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()

            // Add all filter parameters
            if (startDate) params.append('start_date', startDate)
            if (endDate) params.append('end_date', endDate)
            if (gameId && gameId !== 'all') params.append('game_id', gameId)
            if (gameType && gameType !== 'all') params.append('game_type', gameType)
            if (session && session !== 'all') params.append('session', session)
            if (userId) params.append('user_id', userId)

            const response = await fetch(`/api/mainmarketbid?${params.toString()}`)
            const data = await response.json()

            if (data.status) {
                setBids(data.data)
                toast.success(`Found ${data.data.length} bids matching your criteria`)
            } else {
                toast.error(data.message || 'Failed to fetch bids')
                setBids([])
            }
        } catch (error) {
            toast.error('Failed to fetch bids')
            console.error('Error fetching bids:', error)
            setBids([])
        } finally {
            setLoading(false)
        }
    },[startDate,endDate, gameId, gameType, userId, session])

    useEffect(() => {
        fetchBids()
    }, [fetchBids])

    useEffect(() => {
        dispatch(fetchGames({ is_active: true }));
    }, [dispatch])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchBids()
    }

    const handleClearFilters = () => {
        setStartDate('')
        setEndDate('')
        setGameId('all')
        setGameType('all')
        setSession('all')
        setUserId('')
        // Don't fetch immediately, let user click search
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatGameType = (type: string) => {
        const found = gameTypes.find(gt => gt.value === type)
        return found ? found.label : type
    }

    const handleEditBid = (bid: Bid) => {
        setEditingBid(bid);
        setFormData({
            digit: bid.digit || '',
            panna: bid.panna || '',
            bid_amount: bid.bid_amount,
            game_id: bid.game_id,
            game_type: bid.game_type,
            session: bid.session || '',
        });
        setEditDialogOpen(true);
    };

    const handleUpdateBid = async () => {
        if (!editingBid) return;

        setUpdating(true);
        try {
            const response = await fetch('/api/mainmarketbid', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bid_id: editingBid._id,
                    user_id: editingBid.user_id,
                    ...formData
                }),
            });

            const data = await response.json();

            if (data.status) {
                toast.success('Bid updated successfully');
                setEditDialogOpen(false);
                fetchBids(); // Refresh the bids list with current filters
            } else {
                toast.error(data.message || 'Failed to update bid');
            }
        } catch (error) {
            toast.error('Failed to update bid');
            console.error('Error updating bid:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Determine which fields to show based on game type
    const showDigitField = ['single-digit', 'jodi-digit', 'two-digit', 'digit-base-jodi', 'red-bracket', 'half-sangam', 'full-sangam'].includes(formData.game_type);
    const showPannaField = ['single-panna', 'double-panna', 'triple-panna', 'sp-motor', 'dp-motor', 'sp-dp-tp-motor', 'choice-panna', 'half-sangam', 'full-sangam'].includes(formData.game_type);
    const showSessionField = !['full-sangam', 'jodi-digit', 'red-bracket', 'odd-even'].includes(formData.game_type);

    return (
        <div className="container mx-auto space-y-8 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Main Market Bid Report</h1>
                <div className="flex items-center gap-2">
                    <Button onClick={() => fetchBids()} variant="outline" size="sm">
                        <FiRefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button onClick={handleClearFilters} variant="outline" size="sm">
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Enhanced Filter Form */}
            <div className=" rounded-lg">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    {/* Date Range Filters */}
                    <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input 
                            id="start-date"
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input 
                            id="end-date"
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    {/* Game Selection */}
                    <div className="space-y-2">
                        <Label>Game</Label>
                        <Select value={gameId} onValueChange={setGameId}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Select Game" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Games</SelectItem>
                                {games.map((game) => (
                                    <SelectItem key={game._id} value={game._id}>
                                        {game.game_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Game Type */}
                    <div className="space-y-2">
                        <Label>Game Type</Label>
                        <Select value={gameType} onValueChange={setGameType}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Game Types" />
                            </SelectTrigger>
                            <SelectContent >
                                {gameTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                  

                    {/* Submit Button */}
                    <div className="flex items-center mt-4">
                        <Button type="submit" className="w-full">
                            <FiSearch className="mr-2 h-4 w-4" />
                            Search
                        </Button>
                    </div>
                </form>
            </div>

            {/* Results Table */}
            <MainBidTable
                loading={loading}
                bids={bids}
                formatGameType={formatGameType}
                formatCurrency={formatCurrency}
                onEditBid={handleEditBid}
            />

            {/* Edit Bid Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Bid</DialogTitle>
                        <DialogDescription>
                            Update the bid details below.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="game_type" className="text-right">
                                Game
                            </Label>
                            <Select
                                value={formData.game_id}
                                onValueChange={(value) => handleInputChange('game_id', value)}
                            >
                                <SelectTrigger className="col-span-3 w-full">
                                    <SelectValue placeholder="Select game" />
                                </SelectTrigger>
                                <SelectContent>
                                    {games.map((game) => (
                                        <SelectItem key={game._id} value={game._id}>
                                            {game.game_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="game_type" className="text-right">
                                Game Type
                            </Label>
                            <Select
                                value={formData.game_type}
                                onValueChange={(value) => handleInputChange('game_type', value)}
                            >
                                <SelectTrigger className="col-span-3 w-full">
                                    <SelectValue placeholder="Select game type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gameTypes.filter(gt => gt.value !== 'all').map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {showSessionField && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="session" className="text-right">
                                    Session
                                </Label>
                                <Select
                                    value={formData.session}
                                    onValueChange={(value) => handleInputChange('session', value)}
                                >
                                    <SelectTrigger className="col-span-3 w-full">
                                        <SelectValue placeholder="Select session" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sessions.filter(s => s.value !== 'all').map((session) => (
                                            <SelectItem key={session.value} value={session.value}>
                                                {session.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {showDigitField && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="digit" className="text-right">
                                    Digit
                                </Label>
                                <Input
                                    id="digit"
                                    value={formData.digit}
                                    onChange={(e) => handleInputChange('digit', e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        )}

                        {showPannaField && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="panna" className="text-right">
                                    Panna
                                </Label>
                                <Input
                                    id="panna"
                                    value={formData.panna}
                                    onChange={(e) => handleInputChange('panna', e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bid_amount" className="text-right">
                                Amount
                            </Label>
                            <Input
                                id="bid_amount"
                                type="number"
                                value={formData.bid_amount}
                                onChange={(e) => handleInputChange('bid_amount', Number(e.target.value))}
                                className="col-span-3"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDialogOpen(false)}
                            disabled={updating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateBid}
                            disabled={updating}
                        >
                            {updating ? 'Updating...' : 'Update Bid'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default MainMarketBidReports