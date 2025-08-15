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
        image: "https://chatgpt.com",
        order: "ChatGPT",
        isActive: true
    },
    {
        id: 2,
        image: "https://www.linkedin.com/home",
        order: "Linkedin",
        isActive: false
    }
]

const FooterLinks = () => {
    const [sliderList, setSliderList] = useState(sliders)
    const [order, setOrder] = useState("")
   

    return (
        <div className="space-y-6">
            <h1 className='font-semibold text-2xl'> Footer Links</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="order">Name</Label>
                    <Input
                        id="order"
                        type="text"
                        placeholder="Enter name"
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">Link</Label>
                    <Input
                        id="picture"
                        type="url"
                    />
                </div>
            </div>

            <div>
                <Button>
                    Submit
                </Button>
            </div>

            <div className="rounded-md border mt-8">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S.No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Link</TableHead>
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

export default FooterLinks