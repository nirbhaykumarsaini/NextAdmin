"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SingleDigit {
    _id: string;
    digit: number;
}

const TriplePanna = () => {
    const [singleDigits, setSingleDigits] = useState<SingleDigit[] | null>(null)

    useEffect(() => {
        fetchSingleDigit();
    }, []);

    const fetchSingleDigit = async () => {
        try {
            const response = await fetch('/api/panna/triple');
            const result = await response.json();

            if (result.status === false) {
                toast.error(result.message || "Failed to fetch single digits")
            } else {
                setSingleDigits(result.data);
            }
        } catch (error) {
            console.error('Error fetching single digits:', error);
            toast.error('Failed to fetch single digits')
        } 
    };

    return (
        <div className="space-y-6">
            <h1 className='font-semibold text-2xl'>Triple Panna</h1>

            <Card className='bg-white dark:bg-gray-900'>
                <CardHeader>
                    <CardTitle>Total Panna : {singleDigits?.length || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-10 gap-4">
                        {singleDigits?.map((digitObj) => (
                            <Badge
                                key={digitObj._id}
                                variant="outline"
                                className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold"
                            >
                                {digitObj.digit}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default TriplePanna