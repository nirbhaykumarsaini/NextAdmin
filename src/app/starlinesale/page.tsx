"use client"

import React, { useState } from 'react'
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
import { FiCalendar, FiEdit } from 'react-icons/fi'
import { Label } from '@/components/ui/label'


type GameResult = {
    id: string
    date: string
    gameName: string
    gameType: string
}

const results: GameResult[] = [
    {
        id: "1",
        date: "12-08-2025",
        gameName: "Milan Day",
        gameType: "singe-digit",
    },
    {
        id: "2",
        date: "12-08-2025",
        gameName: "Milan Day",
        gameType: "singe-digit",
    },
    {
        id: "3",
        date: "11-08-2025",
        gameName: "Rajdhani Night",
        gameType: "singe-digit",
    }
]

const StarlineSale = () => {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [gameName, setGameName] = useState("")
    const [gameType, setGameType] = useState("")

    return (
        <div className="container mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-center">Starline Sale</h1>

            {/* Result Form */}
            <div className="ite rounded-lg shadow-md ">
                <form className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

                    {/* Session Select */}
                    <div className="space-y-2">
                        <Label>Game Type</Label>
                        <Select onValueChange={setGameType} value={gameType}>
                            <SelectTrigger className='w-full '>
                                <SelectValue placeholder="Select Game Type" />
                            </SelectTrigger>
                            <SelectContent className='bg-white dark:bg-gray-900'>
                                <SelectItem value="Open">Single Digit</SelectItem>
                                <SelectItem value="Close">Jodi Digit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>



                    {/* Submit Button */}
                    <div className="flex items-center justify-center mt-3">
                        <Button type="submit" className="w-full ">
                            Find
                        </Button>
                    </div>
                </form>
            </div>



            {/* Results Table */}
            <div className=" rounded-lg border shadow-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S. No.</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Game Name</TableHead>
                            <TableHead>Session</TableHead>
                            <TableHead>Panna</TableHead>
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
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>
                                    <Button variant="ghost" className="">
                                        <FiEdit />
                                    </Button>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>


        </div>
    )
}

export default StarlineSale