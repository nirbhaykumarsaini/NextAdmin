"use client"

import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'



const AccountSettings = () => {

    return (
        <div className="space-y-6">
            <h1 className='font-semibold text-2xl'>Account Rules & Limits</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="order">Welcome Bonus</Label>
                    <Input
                        id="order"
                        type="text"
                        placeholder="Enter name"
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">Global Batting</Label>
                    <Input
                        id="picture"
                        type="text"
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">Min Deposit</Label>
                    <Input
                        id="picture"
                        type="email"
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">Max Deposit</Label>
                    <Input
                        id="picture"
                        type="url"
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">Min Withdrawal</Label>
                    <Input
                        id="picture"
                        type="email"
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">Max Withdrawal</Label>
                    <Input
                        id="picture"
                        type="url"
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">Min Bid Point</Label>
                    <Input
                        id="picture"
                        type="email"
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">Max Bid Point</Label>
                    <Input
                        id="picture"
                        type="url"
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">Withdrawal TIme</Label>
                    <Select>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Withdrawal Time" />
                        </SelectTrigger>
                        <SelectContent className='bg-white dark:bg-gray-900'>
                            <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value="apple">Morning</SelectItem>
                                <SelectItem value="banana">Evening</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">Withdrawal Open Time</Label>
                    <Input
                        id="picture"
                        type="time"
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">Withdrawal Close Time</Label>
                    <Input
                        id="picture"
                        type="time"
                    />
                </div>
            </div>

            <div>
                <Button>
                    Submit
                </Button>
            </div>
        </div>
    )
}

export default AccountSettings