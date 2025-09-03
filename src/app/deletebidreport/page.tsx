"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { FiCalendar } from "react-icons/fi"
import { useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"

export default function DeleteBidsForm() {
    const [marketType, setMarketType] = useState("")
    const [fromDate, setFromDate] = useState<Date>()
    const [toDate, setToDate] = useState<Date>()
    const [isLoading, setIsLoading] = useState(false)

    const handleDeleteBids = async () => {
        if (window.confirm("Are you sure you want to delete bids?")) { }
        if (!marketType || !fromDate || !toDate) {
            toast.warning("Please select market type and date range")
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch('/api/deletebids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    market_type: marketType,
                    from_date: format(fromDate, 'yyyy-MM-dd'),
                    to_date: format(toDate, 'yyyy-MM-dd')
                }),
            })

            const result = await response.json()

            if (result.status) {
                toast.success(result.message || 'Bids deleted successfully')
            } else {
                toast.error(result.message || 'Failed to delete bids')
            }
        } catch (error) {
            toast.error('Failed to delete bids')
        } finally {
            setIsLoading(false)
        }
    }

    const getMarketTypeLabel = (type: string) => {
        switch (type) {
            case "mainmarket": return "Main Market"
            case "starline": return "Starline"
            case "galidisawar": return "Galidisawar"
            default: return "Selected"
        }
    }

    return (
        <Card className="w-full border-0 bg-transparent space-y-2">
            <CardHeader>
                <CardTitle className="text-center">Delete Bids</CardTitle>
                <p className="text-sm text-center text-destructive">Careful! Deleted bids cannot be recovered</p>
            </CardHeader>

            <CardContent>
                <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <Select value={marketType} onValueChange={setMarketType}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Market Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-900">
                                    <SelectItem value="mainmarket">Main Market</SelectItem>
                                    <SelectItem value="starline">Starline</SelectItem>
                                    <SelectItem value="galidisawar">Galidisawar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <FiCalendar className="mr-2 h-4 w-4" />
                                        <span>{fromDate ? format(fromDate, 'PPP') : "From Date"}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                                    <Calendar
                                        mode="single"
                                        selected={fromDate}
                                        onSelect={setFromDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <FiCalendar className="mr-2 h-4 w-4" />
                                        <span>{toDate ? format(toDate, 'PPP') : "To Date"}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                                    <Calendar
                                        mode="single"
                                        selected={toDate}
                                        onSelect={setToDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-center">
                <Button
                    variant="destructive"
                    className="w-fit"
                    onClick={handleDeleteBids}
                    disabled={isLoading || !marketType || !fromDate || !toDate}
                >
                    {isLoading ? "Deleting..." : `Delete ${getMarketTypeLabel(marketType)} Bids`}
                </Button>
            </CardFooter>
        </Card>
    )
}