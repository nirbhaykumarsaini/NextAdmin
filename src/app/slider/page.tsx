"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
// import { Switch } from "@/components/ui/switch"
// import { FiEdit, FiTrash2 } from 'react-icons/fi'
import { toast } from 'sonner'
import Image from 'next/image'


const Slider = () => {
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchAppConfig();
    }, []);

    const fetchAppConfig = async () => {
        try {
            const response = await fetch('/api/slider');
            const result = await response.json();
            console.log(result)

            if (result.status === false) {
                toast.error(result.message || "Failed to fetch logo")
            } else {
                setImagePreview(result.data.slider_image);
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
        if (!selectedFile) {
            toast.warning('Please provide a image')
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('slider_image', selectedFile);

            const response = await fetch('/api/slider', {
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
            <h1 className='font-semibold text-2xl'> Slider</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

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
                            disabled={isSubmitting || !selectedFile}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            )}

            {/* <div className="rounded-md border mt-8">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S.No.</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sliders.map((slider) => (
                            <TableRow key={slider.id}>
                                <TableCell>{slider.id}</TableCell>
                                <TableCell>{slider.order}</TableCell>
                                <TableCell>
                                    <img
                                        src={slider.image}
                                        alt={`Slider ${slider.id}`}
                                        className="w-20 h-12 object-cover rounded"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={slider.isActive}
                                        onCheckedChange={() => toggleActive(slider.id)}
                                    />
                                </TableCell>
                                <TableCell className='space-x-2'>
                                    <Button
                                        variant="ghost"
                                        size="icon" className="text-primary hover:text-primary/80"
                                        onClick={() => handleDelete(slider.id)}
                                    >
                                        <FiEdit />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon" className="text-destructive hover:text-destructive/80"
                                        onClick={() => handleDelete(slider.id)}
                                    >
                                        <FiTrash2 />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div> */}
        </div>
    )
}

export default Slider