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
        image: "dfklsdfn@icici",
        order: 1,
        isActive: true
    },
    {
        id: 2,
        image: "ksdfkjskd@sbi",
        order: 2,
        isActive: false
    }
]

const ManageUpi = () => {
    const [sliderList, setSliderList] = useState(sliders)


    return (
        <div className="space-y-6">
            <h1 className='font-semibold text-2xl'> Manage UPI</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className="grid w-full max-w-sm items-center gap-3">
                    <Label htmlFor="order">UPI ID</Label>
                    <Input
                        id="order"
                        type="number"
                        placeholder="Enter upi id"
                    />
                </div>
                
            </div>

            <div>
                <Button>
                    Add UPI
                </Button>
            </div>

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
                                  {slider.image}
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={slider.isActive}
                                    />
                                </TableCell>
                                <TableCell className='space-x-2'>
                                    <Button
                                        variant="ghost"
                                        size="icon" className="text-primary hover:text-primary/80"
                                    >
                                        <FiEdit />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon" className="text-destructive hover:text-destructive/80"
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

export default ManageUpi