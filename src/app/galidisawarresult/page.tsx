"use client"

import React, { useState } from 'react'
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
    TableCaption,
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
import { FiCalendar, FiEdit, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

type GameResult = {
    id: string
    date: string
    gameName: string
    digit: string
}

const GalidisawarResult = () => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [gameName, setGameName] = useState("")
    const [digit, setDigit] = useState("")
    const [results, setResults] = useState<GameResult[]>([
        {
            id: "1",
            date: "12-08-2025",
            gameName: "Milan Day",
            digit: "3"
        },
        {
            id: "2",
            date: "12-08-2025",
            gameName: "Milan Day",
            digit: "6"
        },
        {
            id: "3",
            date: "11-08-2025",
            gameName: "Rajdhani Night",
            digit: "9"
        }
    ])
    const [showWinnerDialog, setShowWinnerDialog] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const newResult: GameResult = {
            id: Date.now().toString(),
            date: date ? format(date, "dd-MM-yyyy") : "",
            gameName,
            digit
        }
        setResults([...results, newResult])
        // Show the winner dialog
        setShowWinnerDialog(true)
        // Reset form
        setDate(new Date())
        setGameName("")
        setDigit("")
    }

    return (
        <div className="container mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-center">Galidisawar Results</h1>

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
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
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
                        <Label>Game Name</Label>
                        <Select onValueChange={setGameName} value={gameName}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Select Game" />
                            </SelectTrigger>
                            <SelectContent className='bg-white dark:bg-gray-900'>
                                <SelectItem value="Milan Day">Milan Day</SelectItem>
                                <SelectItem value="Milan Night">Milan Night</SelectItem>
                                <SelectItem value="Rajdhani Day">Rajdhani Day</SelectItem>
                                <SelectItem value="Rajdhani Night">Rajdhani Night</SelectItem>
                                <SelectItem value="Kalyan Morning">Kalyan Morning</SelectItem>
                                <SelectItem value="Kalyan Day">Kalyan Day</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Panna Select */}
                    <div className="space-y-2">
                        <Label>Digit</Label>
                        <Select onValueChange={setDigit} value={digit}>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Select Digit" />
                            </SelectTrigger>
                            <SelectContent className='bg-white dark:bg-gray-900'>
                                <SelectItem value="123">123</SelectItem>
                                <SelectItem value="456">456</SelectItem>
                                <SelectItem value="789">789</SelectItem>
                                <SelectItem value="012">012</SelectItem>
                                <SelectItem value="345">345</SelectItem>
                                <SelectItem value="678">678</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                   

                    {/* Submit Button */}
                    <div className="flex items-center justify-center ">
                        <Button type="submit" className="w-full ">
                            Show Winner
                        </Button>
                    </div>
                </form>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2'>
                <div className="space-y-2">
                    <Label>Result Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className=" justify-start text-left font-normal"
                            >
                                <FiCalendar className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
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

                <div className="space-y-2">
                    <Label>Search</Label>
                    <Input
                    className='w-fit'
                        type="text"
                        placeholder="Search..."
                        value={digit}
                        onChange={(e) => setDigit(e.target.value)}
                    />
                </div>
            </div>

            {/* Results Table */}
            <div className=" rounded-lg border shadow-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S. No.</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Game Name</TableHead>
                            <TableHead>Digit</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((result) => (
                            <TableRow key={result.id}>
                                <TableCell>{result.id}</TableCell>
                                <TableCell>{result.date}</TableCell>
                                <TableCell>{result.gameName}</TableCell>
                                <TableCell>{result.digit}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" className="">
                                        <FiEdit />
                                    </Button>
                                    <Button variant="ghost" className="text-red-600 hover:text-red-800">
                                        <FiTrash2 />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Winner Dialog */}
            <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
                <DialogContent className="sm:max-w-2xl bg-white dark:bg-gray-950">
                    <DialogHeader>
                        <DialogTitle>Winners</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center rounded-lg">
                            <div>
                                <p className="font-medium"> Digit: {digit || "7"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className=" p-4 rounded-lg border">
                                <p className="text-xs ">Total Bid Amount</p>
                                <p className="text-xl font-bold">₹0</p>
                            </div>
                            <div className=" p-4 rounded-lg border">
                                <p className="text-xs ">Total Winning Amount</p>
                                <p className="text-xl font-bold">₹0</p>
                            </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User Name</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Winning Amount</TableHead>
                                        <TableHead>Game Type</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4 ">
                                            No winning bids found
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" onClick={() => setShowWinnerDialog(false)}>
                                Close
                            </Button>
                            <Button>
                                Declare
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default GalidisawarResult