"use client"

import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"



const ContactInfo = () => {

    return (
        <div className="space-y-6">
            <h1 className='font-semibold text-2xl'>Contact Info</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="order">Mobile Number</Label>
                    <Input
                        id="order"
                        type="text"
                        placeholder="Enter name"
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">WhatsApp Number</Label>
                    <Input
                        id="picture"
                        type="text"
                    />
                </div>
                <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">Email</Label>
                    <Input
                        id="picture"
                        type="email"
                    />
                </div>
                 <div className="grid w-full items-center gap-3">
                    <Label htmlFor="picture">Website Link</Label>
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
        </div>
    )
}

export default ContactInfo