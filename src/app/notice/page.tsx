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
import { FiEdit, FiTrash2, FiPlus, FiX } from 'react-icons/fi'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { toast } from 'sonner'

interface Notice {
  _id: string;
  notice_title: string;
  notice_message: string;
  createdAt?: string;
  updatedAt?: string;
}

const NoticeForm = () => {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentNotice, setCurrentNotice] = useState<Notice | null>(null)
  const [formData, setFormData] = useState({
    notice_title: '',
    notice_message: ''
  })

  // Fetch all notices on component mount
  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/notice')
      if (response.data.status) {
        setNotices(response.data.data)
      } else {
        toast.error('Failed to fetch notices')
      }
    } catch (error) {
      console.error('Error fetching notices:', error)
      toast.error('Failed to fetch notices')
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
    
    if (!formData.notice_title.trim()) {
      toast.error('Notice title is required')
      return
    }
    
    if (!formData.notice_message.trim()) {
      toast.error('Notice message is required')
      return
    }

    try {
      setLoading(true)
      if (editMode && currentNotice) {
        // Update existing notice
        const response = await axios.put(`/api/notice?id=${currentNotice._id}`, formData)
        if (response.data.status) {
          toast.success('Notice updated successfully')
          resetForm()
          fetchNotices()
        } else {
          toast.error(response.data.message || 'Failed to update notice')
        }
      } else {
        // Create new notice
        const response = await axios.post('/api/notice', formData)
        if (response.data.status) {
          toast.success('Notice created successfully')
          resetForm()
          fetchNotices()
        } else {
          toast.error(response.data.message || 'Failed to create notice')
        }
      }
    } catch (error: any) {
      console.error('Error saving notice:', error)
      toast.error(error.response?.data?.message || 'Failed to save notice')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (notice: Notice) => {
    setCurrentNotice(notice)
    setFormData({
      notice_title: notice.notice_title,
      notice_message: notice.notice_message
    })
    setEditMode(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return

    try {
      setLoading(true)
      const response = await axios.delete(`/api/notice?id=${id}`)
      if (response.data.status) {
        toast.success('Notice deleted successfully')
        fetchNotices()
      } else {
        toast.error(response.data.message || 'Failed to delete notice')
      }
    } catch (error: any) {
      console.error('Error deleting notice:', error)
      toast.error(error.response?.data?.message || 'Failed to delete notice')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      notice_title: '',
      notice_message: ''
    })
    setEditMode(false)
    setCurrentNotice(null)
  }

  return (
    <div className="space-y-6">
      <h1 className='font-semibold text-2xl'>Notice</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
          <div className="grid w-full">
            <Label htmlFor="notice_title">Title</Label>
            <Input
              id="notice_title"
              name="notice_title"
              type="text"
              value={formData.notice_title}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Enter title"
            />
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="notice_message">Message</Label>
            <Textarea 
              className='w-full' 
              placeholder='Enter message' 
              id='notice_message'
              name="notice_message"
              value={formData.notice_message}
              onChange={handleInputChange}
              disabled={loading}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {editMode ? 'Update Notice' : 'Add Notice'}
            {!editMode && <FiPlus className="ml-2" />}
          </Button>
          {editMode && (
            <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
              <FiX className="mr-2" /> Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="rounded-md border mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.No.</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && notices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : notices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No notices found
                </TableCell>
              </TableRow>
            ) : (
              notices.map((notice, index) => (
                <TableRow key={notice._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{notice.notice_title}</TableCell>
                  <TableCell className="max-w-md truncate">{notice.notice_message}</TableCell>
                  <TableCell className='space-x-2'>
                    <Button
                      variant="ghost"
                      size="icon" 
                      className="text-primary hover:text-primary/80"
                      onClick={() => handleEdit(notice)}
                      disabled={loading}
                    >
                      <FiEdit />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon" 
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => handleDelete(notice._id)}
                      disabled={loading}
                    >
                      <FiTrash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default NoticeForm