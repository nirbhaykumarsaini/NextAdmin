"use client"

import React, { useState, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"



const ManageLogo = () => {
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [order, setOrder] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

   

    return (
        <div className="space-y-6">
              <h1 className='font-semibold text-2xl'> Manage Logo</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className="grid w-full max-w-sm items-center gap-3">
                    <Label htmlFor="app_title">App Title</Label>
                    <Input
                        id="app_title"
                        type="text"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        placeholder="Enter display order"
                    />
                </div>
                <div className="grid w-full max-w-sm items-center gap-3">
                    <Label htmlFor="picture">Logo Image</Label>
                    <Input
                        id="picture"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                </div>
            </div>

            {imagePreview && (
                <div className="mt-4">
                    <Label>Image Preview</Label>
                    <div className="mt-2 w-full max-w-xs">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="rounded-md border w-full h-48 object-cover"
                        />
                    </div>
                    <Button
                        className="mt-4"
                        disabled={!order}
                    >
                        Submit
                    </Button>
                </div>
            )}
        </div>
    )
}

export default ManageLogo