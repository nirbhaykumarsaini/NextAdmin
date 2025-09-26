"use client"

import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FiSave } from 'react-icons/fi'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { toast } from 'sonner'

interface HowToPlayData {
    _id?: string;
    howtoplay_title: string;
    howtoplay_message: string;
    video_id: string;
    createdAt?: string;
    updatedAt?: string;
}

const HowToPlay = () => {
    const [howToPlayData, setHowToPlayData] = useState<HowToPlayData[]>([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        howtoplay_title: '',
        howtoplay_message: '',
        video_id: ''
    })

    // Fetch HowToPlay data on component mount
    useEffect(() => {
        fetchHowToPlayData()
    }, [])

    const fetchHowToPlayData = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/howtoplay')
            if (response.data.status) {
                setHowToPlayData(response.data.data)
                // If there's existing data, pre-fill the form
                if (response.data.data.length > 0) {
                    const firstItem = response.data.data[0]
                    setFormData({
                        howtoplay_title: firstItem.howtoplay_title,
                        howtoplay_message: firstItem.howtoplay_message,
                        video_id: firstItem.video_id
                    })
                }
            } else {
                toast.error('Failed to fetch HowToPlay data')
            }
        } catch (error: unknown) {
            console.error('Error saving HowToPlay:', error)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Failed to save HowToPlay');
            } else if (error instanceof Error) {
                toast.error(error.message || 'Failed to save HowToPlay');
            } else {
                toast.error('Failed to save HowToPlay');
            }
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.howtoplay_title.trim()) {
            toast.error('Title is required')
            return
        }

        if (!formData.howtoplay_message.trim()) {
            toast.error('Message is required')
            return
        }

        if (!formData.video_id.trim()) {
            toast.error('YouTube ID is required')
            return
        }

        try {
            setLoading(true)
            const response = await axios.post('/api/howtoplay', formData)
            if (response.data.status) {
                toast.success(response.data.message)
                fetchHowToPlayData() // Refresh the data
            } else {
                toast.error(response.data.message || 'Failed to save HowToPlay')
            }
        } catch (error: unknown) {
            console.error('Error saving HowToPlay:', error)
            if (error instanceof Error) {
                toast.error(error.message || 'Failed to save HowToPlay')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className='font-semibold text-2xl'>How to Play</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
                    <div className="grid w-full gap-3">
                        <Label htmlFor="howtoplay_title">Title</Label>
                        <Input
                            id="howtoplay_title"
                            name="howtoplay_title"
                            type="text"
                            value={formData.howtoplay_title}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder="Enter title"
                        />
                    </div>
                    <div className="grid w-full gap-3">
                        <Label htmlFor="video_id">YouTube Video ID</Label>
                        <Input
                            id="video_id"
                            name="video_id"
                            type="text"
                            value={formData.video_id}
                            onChange={handleInputChange}
                            disabled={loading}
                            placeholder="Enter YouTube Video ID"
                        />
                    </div>
                    <div className="md:col-span-2 grid w-full items-center gap-3">
                        <Label htmlFor="howtoplay_message">Message</Label>
                        <Textarea
                            className='w-full'
                            placeholder='Enter message'
                            id='howtoplay_message'
                            name="howtoplay_message"
                            value={formData.howtoplay_message}
                            onChange={handleInputChange}
                            disabled={loading}
                            rows={4}
                        />
                    </div>
                </div>

                <div>
                    <Button type="submit" disabled={loading}>
                        <FiSave className="mr-2" />
                        {howToPlayData.length > 0 ? 'Update How to Play' : 'Save How to Play'}
                    </Button>
                </div>
            </form>

        </div>
    )
}

export default HowToPlay