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
import { FiEdit, FiTrash2, FiPlus, FiImage, FiRefreshCw } from 'react-icons/fi'
import axios from 'axios'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'

interface QRCode {
  _id: string;
  qr_code: string;
  qr_code_url?: string;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const ManageQR = () => {
  const [qrData, setQrData] = useState<QRCode | null>(null)
  const [loading, setLoading] = useState(false)
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  // Fetch QR code on component mount
  useEffect(() => {
    fetchQR()
  }, [])

  const fetchQR = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/manageqr')
      if (response.data.status) {
        setQrData(response.data.data)
        if (response.data.data?.qr_code_url) {
          setPreviewUrl(response.data.data.qr_code_url)
        }
      } else {
        toast.error('Failed to fetch QR code')
      }
    } catch (error) {
      console.error('Error fetching QR code:', error)
      toast.error('Failed to fetch QR code')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      setQrFile(file)
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setPreviewUrl(previewUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!qrFile && !qrData) {
      toast.error('QR image is required')
      return
    }

    try {
      setLoading(true)
      
      const submitFormData = new FormData()
      
      // Add QR image file if exists
      if (qrFile) {
        submitFormData.append('qr_image', qrFile)
      }

      if (qrData) {
        // Update existing QR code
        const response = await axios.put(`/api/manageqr?id=${qrData._id}`, submitFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        if (response.data.status) {
          toast.success('QR code updated successfully')
          resetForm()
          fetchQR()
        } else {
          toast.error(response.data.message || 'Failed to update QR code')
        }
      } else {
        // Create new QR code (only if no existing QR)
        const response = await axios.post('/api/manageqr', submitFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        if (response.data.status) {
          toast.success('QR code added successfully')
          resetForm()
          fetchQR()
        } else {
          toast.error(response.data.message || 'Failed to add QR code')
        }
      }
    } catch (error: unknown) {
      console.error('Error saving QR code:', error)
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to save QR code');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to save QR code');
      }
    } finally {
      setLoading(false)
      setQrFile(null)
    }
  }

  const handleDelete = async () => {
    if (!qrData) return
    
    if (!confirm('Are you sure you want to delete this QR code?')) return

    try {
      setLoading(true)
      const response = await axios.delete(`/api/manageqr?id=${qrData._id}`)
      if (response.data.status) {
        toast.success('QR code deleted successfully')
        resetForm()
        fetchQR()
      } else {
        toast.error(response.data.message || 'Failed to delete QR code')
      }
    } catch (error: unknown) {
      console.error('Error deleting QR code:', error)
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to delete QR code');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to delete QR code');
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!qrData) return

    try {
      setLoading(true)
      const response = await axios.patch(`/api/manageqr?id=${qrData._id}`)
      console.log(response.data)
      if (response.data.status) {
        toast.success(response.data.message || `QR code ${!qrData.is_active ? 'activated' : 'deactivated'} successfully`)
        fetchQR()
      } else {
        toast.error(response.data.message || 'Failed to toggle QR code status')
      }
    } catch (error: unknown) {
      console.error('Error toggling QR code status:', error)
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to toggle QR code status');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to toggle QR code status');
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setQrFile(null)
    setPreviewUrl(qrData?.qr_code_url || '')
    
    // Clear file input
    const fileInput = document.getElementById('qr_code') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const refreshQR = () => {
    fetchQR()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className='font-semibold text-2xl'>Manage QR Code</h1>
        {qrData && (
          <Button
            variant="outline"
            size="sm"
            onClick={refreshQR}
            disabled={loading}
          >
            <FiRefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="qr_code">
              QR Code Image {qrData && <span className="text-muted-foreground">(Update existing QR)</span>}
            </Label>
            <div className="space-y-3">
              <Input
                id="qr_code"
                name="qr_code"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                required={!qrData} // Required only when no QR exists
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: JPEG, PNG, WebP. Max size: 5MB
              </p>
              {(previewUrl || qrData?.qr_code_url) && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    {qrFile ? 'Preview:' : 'Current QR Code:'}
                  </p>
                  <div className="relative w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl || qrData?.qr_code_url || ''}
                      alt="QR Code"
                      fill
                      className="object-contain p-2"
                      
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Info */}
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">QR Code Information</h3>
              {qrData ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${qrData.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                      {qrData.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(qrData.createdAt || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{new Date(qrData.updatedAt || '').toLocaleDateString()}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No QR code configured. Upload a QR code image to get started.
                </p>
              )}
            </div>

            {/* Status Toggle */}
            {qrData && (
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="qr-status" className="text-base font-medium">
                      QR Code Status
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {qrData.is_active 
                        ? 'QR code is currently active and visible' 
                        : 'QR code is currently inactive and hidden'
                      }
                    </p>
                  </div>
                  <Switch
                    id="qr-status"
                    checked={qrData.is_active}
                    onCheckedChange={handleToggleStatus}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={loading}
            className="min-w-32"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {qrData ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                {qrData ? 'Update QR Code' : 'Add QR Code'}
                {!qrData && <FiPlus className="ml-2" />}
              </>
            )}
          </Button>
          
          {qrData && (
            <>
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm}
                disabled={loading}
              >
                Clear Selection
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={loading}
                className="ml-auto"
              >
                <FiTrash2 className="mr-2" />
                Delete QR
              </Button>
            </>
          )}
        </div>
      </form>

      {/* Empty State */}
      {!qrData && !loading && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <FiImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No QR Code Configured</h3>
          <p className="text-gray-500 mb-4">
            Upload a QR code image to enable QR code functionality.
          </p>
        </div>
      )}
    </div>
  )
}

export default ManageQR