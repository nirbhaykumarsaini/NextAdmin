"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { FiCalendar } from "react-icons/fi"
import { format } from "date-fns"
import { toast } from "sonner"

export default function DeleteDataForm() {
  const [activeTab, setActiveTab] = useState("bids")
  const [marketType, setMarketType] = useState("")
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)

  const endpointMap: Record<string, string> = {
    bids: "/api/delete/bids",
    winners: "/api/delete/winners",
    withdrawals: "/api/delete/withdrawals",
    funds: "/api/delete/funds",
  }

  const handleDelete = async () => {
    if (!fromDate || !toDate) {
      toast.warning("Please select date range")
      return
    }

    if ((activeTab === "bids" || activeTab === "winners") && !marketType) {
      toast.warning("Please select market type")
      return
    }

    if (!window.confirm(`Are you sure you want to delete ${activeTab}?`)) return

    setIsLoading(true)
    try {
      const response = await fetch(endpointMap[activeTab], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market_type: marketType || undefined,
          from_date: format(fromDate, "yyyy-MM-dd"),
          to_date: format(toDate, "yyyy-MM-dd"),
        }),
      })

      const result = await response.json()
      if (result.status) toast.success(result.message || `${activeTab} deleted successfully`)
      else toast.error(result.message || `Failed to delete ${activeTab}`)
    } catch (err) {
      toast.error(`Error deleting ${activeTab}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-0 bg-transparent space-y-4 px-4 sm:px-6 lg:px-8">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold">
          {`Delete ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        </CardTitle>
        <p className="text-xs sm:text-sm text-destructive">
          ⚠️ Deleted data cannot be recovered
        </p>
      </CardHeader>

      {/* Tabs */}
      <Tabs defaultValue="bids" onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="flex w-max sm:w-full justify-start sm:justify-center mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1">
            <TabsTrigger value="bids" className="px-3 sm:px-4 py-2 text-sm sm:text-base">Bids</TabsTrigger>
            <TabsTrigger value="winners" className="px-3 sm:px-4 py-2 text-sm sm:text-base">Winners</TabsTrigger>
            <TabsTrigger value="withdrawals" className="px-3 sm:px-4 py-2 text-sm sm:text-base">Withdrawals</TabsTrigger>
            <TabsTrigger value="funds" className="px-3 sm:px-4 py-2 text-sm sm:text-base">Funds</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab}>
          <CardContent className="flex flex-col items-center gap-4 sm:gap-6">
            {/* Market Type */}
            {(activeTab === "bids" || activeTab === "winners") && (
              <Select value={marketType} onValueChange={setMarketType}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select Market Type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900">
                  <SelectItem value="mainmarket">Main Market</SelectItem>
                  <SelectItem value="starline">Starline</SelectItem>
                  <SelectItem value="galidisawar">Galidisawar</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Date Range & Button */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 w-full">
              {/* From Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-48 justify-center">
                    <FiCalendar className="mr-2 h-4 w-4" />
                    <span>{fromDate ? format(fromDate, "PPP") : "From Date"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                  <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
                </PopoverContent>
              </Popover>

              {/* To Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-48 justify-center">
                    <FiCalendar className="mr-2 h-4 w-4" />
                    <span>{toDate ? format(toDate, "PPP") : "To Date"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900">
                  <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus />
                </PopoverContent>
              </Popover>

              {/* Delete Button */}
              <Button
                variant="destructive"
                className="w-full sm:w-48"
                onClick={handleDelete}
                disabled={
                  isLoading ||
                  !fromDate ||
                  !toDate ||
                  ((activeTab === "bids" || activeTab === "winners") && !marketType)
                }
              >
                {isLoading
                  ? "Deleting..."
                  : `Delete ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              </Button>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
