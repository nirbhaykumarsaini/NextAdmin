"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface GameStatus {
  galidisawar: boolean
  starline: boolean
}

export default function GameToggleForm() {
  const [status, setStatus] = useState<GameStatus>({ galidisawar: false, starline: false })
  const [loading, setLoading] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/game-status")
      const data = await res.json()
      if (data.status) setStatus(data.data)
    } catch {
      toast.error("Failed to fetch game status")
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleToggle = async (key: keyof GameStatus, value: boolean) => {
    setStatus((prev) => ({ ...prev, [key]: value }))
    setLoading(true)
    try {
      const res = await fetch("/api/game-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: key, enabled: value }),
      })
      const data = await res.json()
      if (data.status) {
        toast.success(`${key.toUpperCase()} turned ${value ? "ON" : "OFF"}`)
      } else {
        toast.error(data.message || "Failed to update status")
      }
    } catch {
      toast.error("Error updating game status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto mt-8 p-4 sm:p-6 border border-gray-200 shadow-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-lg sm:text-xl font-semibold">
          Manage Game Availability
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm">
          <Label htmlFor="galidisawar">Galidisawar Game</Label>
          <div className="flex items-center gap-3">
            <span className={`text-xs ${status.galidisawar ? "text-green-600" : "text-red-500"}`}>
              {status.galidisawar ? "ON" : "OFF"}
            </span>
            <Switch
              id="galidisawar"
              checked={status.galidisawar}
              onCheckedChange={(v) => handleToggle("galidisawar", v)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm">
          <Label htmlFor="starline">Starline Game</Label>
          <div className="flex items-center gap-3">
            <span className={`text-xs ${status.starline ? "text-green-600" : "text-red-500"}`}>
              {status.starline ? "ON" : "OFF"}
            </span>
            <Switch
              id="starline"
              checked={status.starline}
              onCheckedChange={(v) => handleToggle("starline", v)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="text-center">
          <Button variant="outline" size="sm" onClick={fetchStatus} disabled={loading}>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
