"use client"

import React, { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import axios from 'axios'

interface ContactInfoData {
  mobile_number: string;
  whatshapp_number: string;
  website_link: string;
  telegram_channel: string;
  email: string;
}

const ContactInfo = () => {
  const [formData, setFormData] = useState<ContactInfoData>({
    mobile_number: '',
    whatshapp_number: '',
    website_link: '',
    telegram_channel: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)

  // Fetch existing contact info on component mount
  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get('/api/contactinfo')
      if (response.data.status && response.data.data) {
        // Ensure all fields have string values, not null or undefined
        const contactData = response.data.data
        setFormData({
          mobile_number: contactData.mobile_number || '',
          whatshapp_number: contactData.whatshapp_number || '',
          website_link: contactData.website_link || '',
          telegram_channel: contactData.telegram_channel || '',
          email: contactData.email || ''
        })
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to load contact information');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to load contact information');
      } else {
        toast.error('Failed to load contact information');
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/contactinfo', formData)

      if (response.data.status) {
        toast.success(response.data.message || 'Contact information saved successfully!')
      } else {
        toast.error(response.data.message || 'Failed to save contact information')
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to save contact information');
      } else if (error instanceof Error) {
        toast.error(error.message || 'Failed to save contact information');
      } else {
        toast.error('Failed to save contact information');
      }
    } finally {
      setLoading(false)
    }
  }



  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className='font-semibold text-2xl'>Contact Info</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

        <div className="grid w-full items-center gap-3">
          <Label htmlFor="mobile_number">Mobile Number</Label>
          <Input
            id="mobile_number"
            name="mobile_number"
            type="text"
            placeholder="Enter mobile number"
            value={formData.mobile_number}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid w-full items-center gap-3">
          <Label htmlFor="whatshapp_number">WhatsApp Number</Label>
          <Input
            id="whatshapp_number"
            name="whatshapp_number"
            type="text"
            placeholder="Enter WhatsApp number"
            value={formData.whatshapp_number}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid w-full items-center gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid w-full items-center gap-3">
          <Label htmlFor="website_link">Website Link</Label>
          <Input
            id="website_link"
            name="website_link"
            type="url"
            placeholder="Enter website URL"
            value={formData.website_link}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid w-full items-center gap-3">
          <Label htmlFor="telegram_channel">Telegram Channel</Label>
          <Input
            id="telegram_channel"
            name="telegram_channel"
            type="url"
            placeholder="Enter Telegram channel URL"
            value={formData.telegram_channel}
            onChange={handleInputChange}
          />
        </div>

      </div>

      <div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

export default ContactInfo