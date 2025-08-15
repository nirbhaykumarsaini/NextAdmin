"use client"

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Textarea } from '@/components/ui/textarea'

const Maintenance = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isMaintenanceMode) {
      // Handle enabling maintenance mode
      console.log('Enabling maintenance mode with:', {
        title,
        date,
        time,
        message
      })
    } else {
      // Handle disabling maintenance mode
      console.log('Disabling maintenance mode')
      // Reset form fields when disabling
      setTitle('')
      setDate(undefined)
      setTime('')
      setMessage('')
    }
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Maintenance Mode</h1>
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-1 rounded-md text-xs font-medium",
            isMaintenanceMode ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          )}>
            {isMaintenanceMode ? "Active" : "Inactive"}
          </span>
          <Switch 
            checked={isMaintenanceMode}
            onCheckedChange={setIsMaintenanceMode}
          />
        </div>
      </div>

      {isMaintenanceMode ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">Maintenance mode is currently active. Users will see your maintenance page.</p>
        </div>
      ) : (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800">Maintenance mode is currently inactive. Users can access your site normally.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {isMaintenanceMode && (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expected Completion Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd-MM-yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
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
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Maintenance Message *</Label>
              <Textarea
                id="message"
                placeholder="Enter maintenance message for users"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant={isMaintenanceMode ? "default" : "destructive"}>
            {isMaintenanceMode ? "Update Maintenance Settings" : "Disable Maintenance"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Maintenance