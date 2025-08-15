import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { FiCalendar } from "react-icons/fi"

export default function DeleteBidsForm() {
    return (
        <Card className="w-full border-0 bg-transparent space-y-2">
            <CardHeader>
                <CardTitle className="text-center">Delete Bids</CardTitle>
                <p className="text-sm text-center text-destructive">Careful! Deleted bids cannot be recovered</p>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="manual">
                    <TabsList className="grid w-full grid-cols-2 gap-3 bg-white dark:bg-gray-800">
                        <TabsTrigger className="bg-white dark:bg-gray-900" value="manual">Manual Delete</TabsTrigger>
                        <TabsTrigger className="bg-white dark:bg-gray-900" value="auto">Auto Cleanup</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual">
                        <div className="space-y-4 mt-4">

                            <div className="grid grid-cols-1 md:grid-cols-3 space-x-3">
                                <div>
                                    <Select>
                                        <SelectTrigger className="w-full ">
                                            <SelectValue placeholder="Select Game" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-900">
                                             <SelectItem value="mainmarket">Main Market</SelectItem>
                                            <SelectItem value="starline">Starline</SelectItem>
                                            <SelectItem value="gali">Gali Disawar</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full">
                                                <FiCalendar className="mr-2 h-4 w-4" />
                                                <span>From Date</span>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                                            <Calendar mode="single" initialFocus />
                                        </PopoverContent>
                                    </Popover>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full">
                                                <FiCalendar className="mr-2 h-4 w-4" />
                                                <span>To Date</span>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                                            <Calendar mode="single" initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3  mt-4">
                            <Select>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Game" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-900">
                                    <SelectItem value="mainmarket">Main Market</SelectItem>
                                    <SelectItem value="starline">Starline</SelectItem>
                                    <SelectItem value="gali">Galidisawar</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select time period" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-900">
                                    <SelectItem value="1">1 Month</SelectItem>
                                    <SelectItem value="3">3 Months</SelectItem>
                                    <SelectItem value="6">6 Months</SelectItem>
                                    <SelectItem value="12">1 Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>

            <CardFooter className="flex justify-center">
                <Button variant="destructive" className="w-fit">
                    {`Delete Selected Main Market Bids`}
                </Button>
            </CardFooter>
        </Card>
    )
}