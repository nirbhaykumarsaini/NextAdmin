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
import { Switch } from "@/components/ui/switch"
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi'
import axios from 'axios'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

interface UPI {
  _id: string;
  upi_id: string;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const ManageUpi = () => {
  const [upiList, setUpiList] = useState<UPI[]>([])
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentUpi, setCurrentUpi] = useState<UPI | null>(null)
  const [formData, setFormData] = useState({
    upi_id: ''
  })

  // Fetch all UPIs on component mount
  useEffect(() => {
    fetchUpis()
  }, [])

  const fetchUpis = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/manageupi')
      if (response.data.status) {
        setUpiList(response.data.data)
      } else {
        toast.error('Failed to fetch UPIs')
      }
    } catch (error) {
      console.error('Error fetching UPIs:', error)
      toast.error('Failed to fetch UPIs')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData({ upi_id: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.upi_id.trim()) {
      toast.error('UPI ID is required')
      return
    }

    try {
      setLoading(true)
      if (editMode && currentUpi) {
        // Update existing UPI
        const response = await axios.put(`/api/manageupi?id=${currentUpi._id}`, formData)
        if (response.data.status) {
          toast.success('UPI updated successfully')
          resetForm()
          fetchUpis()
        } else {
          toast.error(response.data.message || 'Failed to update UPI')
        }
      } else {
        // Create new UPI
        const response = await axios.post('/api/manageupi', formData)
        if (response.data.status) {
          toast.success('UPI added successfully')
          resetForm()
          fetchUpis()
        } else {
          toast.error(response.data.message || 'Failed to add UPI')
        }
      }
    } catch (error: unknown) {
      console.error('Error saving UPI:', error)
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to save UPI');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to save UPI');
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (upi: UPI) => {
    setCurrentUpi(upi)
    setFormData({ upi_id: upi.upi_id })
    setEditMode(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this UPI?')) return

    try {
      setLoading(true)
      const response = await axios.delete(`/api/manageupi?id=${id}`)
      if (response.data.status) {
        toast.success('UPI deleted successfully')
        fetchUpis()
      } else {
        toast.error(response.data.message || 'Failed to delete UPI')
      }
    } catch (error: unknown) {
      console.error('Error deleting UPI:', error)
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to delete UPI');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to delete UPI');
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (upi: UPI) => {
    try {
      setLoading(true)
      const response = await axios.patch(`/api/manageupi?id=${upi._id}`)
      if (response.data.status) {
        toast.success(`UPI ${!upi.is_active ? 'activated' : 'deactivated'} successfully`)
        fetchUpis()
      } else {
        toast.error(response.data.message || 'Failed to toggle UPI status')
      }
    } catch (error: unknown) {
      console.error('Error toggling UPI status:', error)
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to toggle UPI status');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to toggle UPI status');
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ upi_id: '' })
    setEditMode(false)
    setCurrentUpi(null)
  }

  return (
    <div className="space-y-6">
      <h1 className='font-semibold text-2xl'>Manage UPI</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="upi_id">UPI ID</Label>
            <Input
              id="upi_id"
              type="text"
              placeholder="Enter UPI ID (e.g., username@upi)"
              value={formData.upi_id}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {editMode ? 'Update UPI' : 'Add UPI'}
            {!editMode && <FiPlus className="ml-2" />}
          </Button>
          {editMode && (
            <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="rounded-md border mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.No.</TableHead>
              <TableHead>UPI ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 1 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className='flex space-x-2'>
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : upiList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No UPI's found
                </TableCell>
              </TableRow>
            ) : (
              upiList.map((upi, index) => (
                <TableRow key={upi._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{upi.upi_id}</TableCell>
                  <TableCell>
                    <Switch
                      checked={upi.is_active}
                      onCheckedChange={() => handleToggleStatus(upi)}
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm">
                      {upi.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className='space-x-2'>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:text-primary/80"
                      onClick={() => handleEdit(upi)}
                      disabled={loading}
                    >
                      <FiEdit />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => handleDelete(upi._id)}
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

export default ManageUpi