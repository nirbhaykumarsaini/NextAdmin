"use client"

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from '@/components/ui/textarea'

const NotificationForm = () => {
  const [targetUsers, setTargetUsers] = useState<'all' | 'zero'>('all')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    
    try {
      // Simulate API call
      console.log('Sending notification:', {
        targetUsers,
        title,
        message
      })
      
      // In a real app, you would call your API here
      // await sendNotification({ targetUsers, title, message });
      
      // Reset form after successful submission
      setTitle('')
      setMessage('')
      alert('Notification sent successfully!')
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Failed to send notification')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="mx-auto  space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Send Notification</h1>
        <p className="text-muted-foreground">
          Send push notifications to selected user groups
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Label>Target Users</Label>
          <RadioGroup 
            value={targetUsers}
            onValueChange={(value: 'all' | 'zero') => setTargetUsers(value)}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all-users" />
              <Label htmlFor="all-users">All Users</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="zero" id="zero-balance" />
              <Label htmlFor="zero-balance">Zero Balance Users</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Notification Title *</Label>
          <Input
            id="title"
            placeholder="Enter notification title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Notification Message *</Label>
          <Textarea
            id="message"
            placeholder="Enter your notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
          />
          <p className="text-sm text-muted-foreground">
            This message will be displayed to users
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSending}>
            {isSending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : 'Send Notification'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default NotificationForm