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
import { Textarea } from '@/components/ui/textarea'

type Notice = {
    id:number,
    title: string,
    notice_message: string
}


const notices = [
    {
        id: 1,
        title: "Hello User",
        notice_message: "sdhjkfhjskd"
    },
    {
        id: 2,
        title: "Hello User",
        notice_message: "sdhjkfhjskd"
    }
]


const Notice = () => {
    const [order, setOrder] = useState("")

    return (
        <div className="space-y-6">
              <h1 className='font-semibold text-2xl'> Notice</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
                <div className="grid w-full ">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        type="text"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        placeholder="Enter title"
                    />
                </div>
                <div className="grid w-full  items-center gap-3">
                    <Label htmlFor="notice_message">Picture</Label>
                    <Textarea className='w-full' placeholder='Message' id='notice_message' />
                </div>
            </div>


            <div className="rounded-md border mt-8">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>S.No.</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Messgae</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {notices.map((notice: Notice) => (
                            <TableRow key={notice.id}>
                                <TableCell>{notice.id}</TableCell>
                                <TableCell>{notice.title}</TableCell>
                                <TableCell>{notice.notice_message}</TableCell>
                                <TableCell>Active</TableCell>
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

export default Notice