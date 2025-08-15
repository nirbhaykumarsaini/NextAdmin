"use client"

import React, { useState, useRef } from 'react'
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
import { FiEdit, FiTrash2 } from 'react-icons/fi'

// Dummy slider data with Unsplash images
const sliders = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1?w=500&auto=format&fit=crop",
        order: 1,
        isActive: true
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1682695796954-bad0d0f59ff1?w=500&auto=format&fit=crop",
        order: 2,
        isActive: false
    }
]

const Slider = () => {
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [sliderList, setSliderList] = useState(sliders)
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

    const handleAddSlider = () => {
        if (!imagePreview || !order) return

        const newSlider = {
            id: sliderList.length + 1,
            image: imagePreview,
            order: parseInt(order),
            isActive: true
        }

        setSliderList([...sliderList, newSlider])
        setImagePreview(null)
        setOrder("")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const toggleActive = (id: number) => {
        setSliderList(sliderList.map(slider =>
            slider.id === id ? { ...slider, isActive: !slider.isActive } : slider
        ))
    }

    const handleDelete = (id: number) => {
        setSliderList(sliderList.filter(slider => slider.id !== id))
    }

    return (
        <div className="space-y-6">
              <h1 className='font-semibold text-2xl'> Slider</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className="grid w-full max-w-sm items-center gap-3">
                    <Label htmlFor="order">Order</Label>
                    <Input
                        id="order"
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        placeholder="Enter display order"
                    />
                </div>
                <div className="grid w-full max-w-sm items-center gap-3">
                    <Label htmlFor="picture">Picture</Label>
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
                        onClick={handleAddSlider}
                        disabled={!order}
                    >
                        Add to Slider
                    </Button>
                </div>
            )}

            <div className="rounded-md border mt-8">
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
                        {sliderList.map((slider) => (
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
            </div>
        </div>
    )
}

export default Slider