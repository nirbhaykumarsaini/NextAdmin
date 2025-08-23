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
import { FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi'
import axios from 'axios'
import { toast } from 'sonner'

interface FooterLink {
  _id: string
  footer_name: string
  footer_link: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

const FooterLinks = () => {
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([])
  const [name, setName] = useState("")
  const [link, setLink] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Fetch footer links on component mount
  useEffect(() => {
    fetchFooterLinks()
  }, [])

  const fetchFooterLinks = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('/api/footerlinks')

      if (response.data.status === false) {
        toast.error(response.data.message || 'Failed to fetch footer links')
      } else {
        setFooterLinks(response.data.data)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch footer links')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !link) {
      setError('Please fill in both fields')
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append('footer_name', name)
      formData.append('footer_link', link)

      const url = editingId ? `/api/footerlinks?id=${editingId}` : '/api/footerlinks'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: editingId ? JSON.stringify({ footer_name: name, footer_link: link }) : formData,
        headers: editingId ? { 'Content-Type': 'application/json' } : {}
      })

      const data = await response.json()

      if (data.status) {
        toast.success(editingId ? 'Footer link updated successfully' : 'Footer link created successfully')
        fetchFooterLinks()
        setName("")
        setLink("")
        setEditingId(null)
      } else {
        toast.error(data.message || 'Failed to save footer link')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save footer link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (footerLink: FooterLink) => {
    setName(footerLink.footer_name)
    setLink(footerLink.footer_link)
    setEditingId(footerLink._id)
    setError("")
    setSuccess("")
  }

  const handleCancelEdit = () => {
    setName("")
    setLink("")
    setEditingId(null)
    setError("")
    setSuccess("")
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this footer link?')) {
      return
    }

    try {
      const response = await axios.delete(`/api/footerlinks?id=${id}`)

      if (response.data.status === false) {
        toast.error(response.data.message || "Error deleting footer link")
      } else {
        toast.success(response.data.message || 'Footer link deleted successfully')
        fetchFooterLinks()
      }
    } catch (error: any) {
      toast.error(error.message || "Error deleting footer link")
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await axios.patch(`/api/footerlinks?id=${id}`)

      if (response.data.status === false) {
        toast.error(response.data.message || 'Failed to update footer link status')
      } else {
        toast.success(`Footer link ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        fetchFooterLinks()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update footer link status')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className='font-semibold text-2xl'>Footer Links</h1>

      {(error || success) && (
        <div className={`p-4 rounded-md ${error ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-800'}`}>
          {error || success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              type="url"
              placeholder="Enter URL (e.g., https://example.com)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : editingId ? 'Update' : 'Submit'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
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
              <TableHead>Name</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && footerLinks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : footerLinks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No footer links found. Create one above.
                </TableCell>
              </TableRow>
            ) : (
              footerLinks.map((footerLink, index) => (
                <TableRow key={footerLink._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{footerLink.footer_name}</TableCell>
                  <TableCell>
                    <a
                      href={footerLink.footer_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all"
                    >
                      {footerLink.footer_link}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={footerLink.isActive}
                        onCheckedChange={() => toggleActive(footerLink._id, footerLink.isActive)}
                        disabled={isLoading}
                      />
                      <span className={footerLink.isActive ? 'text-green-600' : 'text-destructive'}>
                        {footerLink.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:text-primary/80"
                      onClick={() => handleEdit(footerLink)}
                      disabled={isLoading}
                    >
                      <FiEdit />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => handleDelete(footerLink._id)}
                      disabled={isLoading}
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

export default FooterLinks