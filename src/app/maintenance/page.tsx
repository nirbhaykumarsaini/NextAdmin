"use client"

import React, { useState, useEffect } from 'react'
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
import axios from 'axios'
import { toast } from 'sonner'

interface MaintenanceSettings {
  _id?: string;
  is_active: boolean;
  maintenance_title: string;
  expected_completion_date?: Date | null;
  expected_completion_time?: string;
  maintenance_message: string;
}

const Maintenance = () => {
  const [loading, setLoading] = useState(false)
  const [maintenanceSettings, setMaintenanceSettings] = useState<MaintenanceSettings>({
    is_active: false,
    maintenance_title: '',
    expected_completion_date: null,
    expected_completion_time: '',
    maintenance_message: ''
  })

  // Fetch maintenance settings on component mount
  useEffect(() => {
    fetchMaintenanceSettings()
  }, [])

  const fetchMaintenanceSettings = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/maintenance')
      if (response.data.status) {
        setMaintenanceSettings(response.data.data)
      } else {
        toast.error('Failed to fetch maintenance settings')
      }
    } catch (error) {
      console.error('Error fetching maintenance settings:', error)
      toast.error('Failed to fetch maintenance settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      const response = await axios.post('/api/maintenance', maintenanceSettings)

      if (response.data.status) {
        toast.success(response.data.message)
        fetchMaintenanceSettings() // Refresh the data
      } else {
        toast.error(response.data.message || 'Failed to update maintenance settings')
      }
    } catch (error: unknown) {
      console.error('Error updating maintenance settings:', error)
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update maintenance settings');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to update maintenance settings');
      } else {
        toast.error('Failed to update maintenance settings');
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setMaintenanceSettings(prev => ({
      ...prev,
      is_active: checked
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setMaintenanceSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateChange = (date: Date | undefined) => {
    setMaintenanceSettings(prev => ({
      ...prev,
      expected_completion_date: date || null
    }))
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Maintenance Mode</h1>
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-1 rounded-md text-xs font-medium",
            maintenanceSettings.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          )}>
            {maintenanceSettings.is_active ? "Active" : "Inactive"}
          </span>
          <Switch
            checked={maintenanceSettings.is_active}
            onCheckedChange={handleSwitchChange}
            disabled={loading}
          />
        </div>
      </div>

      {maintenanceSettings.is_active ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">Maintenance mode is currently active. Users will see your maintenance page.</p>
        </div>
      ) : (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800">Maintenance mode is currently inactive. Users can access your site normally.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {maintenanceSettings.is_active && (
          <>
            <div className="space-y-2">
              <Label htmlFor="maintenance_title">Maintenance Title</Label>
              <Input
                id="maintenance_title"
                name="maintenance_title"
                placeholder="Enter Title"
                value={maintenanceSettings.maintenance_title}
                onChange={handleInputChange}
                disabled={loading}
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
                        !maintenanceSettings.expected_completion_date && "text-muted-foreground"
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {maintenanceSettings.expected_completion_date ?
                        format(maintenanceSettings.expected_completion_date, "dd-MM-yyyy") :
                        <span>Pick a date</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={maintenanceSettings.expected_completion_date || undefined}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_completion_time">Expected Completion Time</Label>
                <Input
                  id="expected_completion_time"
                  name="expected_completion_time"
                  type="time"
                  value={maintenanceSettings.expected_completion_time}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenance_message">Maintenance Message *</Label>
              <Textarea
                id="maintenance_message"
                name="maintenance_message"
                placeholder="Enter maintenance message for users"
                value={maintenanceSettings.maintenance_message}
                onChange={handleInputChange}
                required={maintenanceSettings.is_active}
                disabled={loading}
              />
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            variant={maintenanceSettings.is_active ? "default" : "destructive"}
            disabled={loading}
          >
            {loading ? "Saving..." : maintenanceSettings.is_active ? "Update Maintenance Settings" : "Disable Maintenance"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Maintenance