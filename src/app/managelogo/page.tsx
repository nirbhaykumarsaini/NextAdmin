// components/ManageLogo.tsx
"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import Image from 'next/image'

interface AppConfig {
    _id?: string;
    app_title: string;
    logo_image: string;
}

const ManageLogo = () => {
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [app_title, setAppTitle] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Fetch current config on component mount
    useEffect(() => {
        fetchAppConfig();
    }, []);

    const fetchAppConfig = async () => {
        try {
            const response = await fetch('/api/logo');
            const result = await response.json();
            console.log(result)

            if (result.status === false) {
                toast.error(result.message || "Failed to fetch logo")
            } else {
                setAppTitle(result.data.app_title);
                setImagePreview(result.data.logo_image);
            }
        } catch (error) {
            console.error('Error fetching app config:', error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async () => {
        if (!app_title || !selectedFile) {
            toast.warning('Please provide both app title and logo image')
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('app_title', app_title);
            formData.append('logo_image', selectedFile);

            const response = await fetch('/api/logo', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.status === false) {
                toast.error(result.message || "Failed to add app config")
            } else {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setSelectedFile(null);
                fetchAppConfig()
                toast.success(result.message || "Logo and app title saved successfully")
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to add app config")
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            <h1 className='font-semibold text-2xl'>Manage Logo</h1>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="app_title">App Title</Label>
                    <Input
                        id="app_title"
                        type="text"
                        value={app_title}
                        onChange={(e) => setAppTitle(e.target.value)}
                        placeholder="Enter your app title"
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="logo_image">Logo Image</Label>
                    <Input
                        id="logo_image"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                </div>
            </div>

            {(
                <div className="mt-6">
                    <Label>Image Preview</Label>
                    <div className="mt-2 flex flex-col items-start gap-4">
                        {imagePreview && <Image
                            src={imagePreview}
                            alt="Preview"
                            className="rounded-md border w-48 h-48 object-contain"
                            width={192}
                            height={192}
                        />}
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !app_title || !selectedFile}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManageLogo