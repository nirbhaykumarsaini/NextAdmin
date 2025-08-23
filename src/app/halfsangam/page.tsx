"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SingleDigit {
    _id: string;
    digit: number;
}

const SingleDigit = () => {
    const [singleDigits, setSingleDigits] = useState<SingleDigit[] | null>(null)
    const [allPanna, setAllPanna] = useState<SingleDigit[] | null>(null)

    useEffect(() => {
        fetchSingleDigit();
        fetchAllPanna()
    }, []);

    const fetchSingleDigit = async () => {
        try {
            const response = await fetch('/api/singledigit');
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

     const fetchAllPanna = async () => {
        try {
            const response = await fetch('/api/panna/all');
            const result = await response.json();

            if (result.status === false) {
                toast.error(result.message || "Failed to fetch single digits")
            } else {
                setAllPanna(result.data);
            }
        } catch (error) {
            console.error('Error fetching single digits:', error);
            toast.error('Failed to fetch single digits')
        } 
    };

    return (
        <div className="space-y-6">
            <h1 className='font-semibold text-2xl'>Half Sangam</h1>

            <Card className='bg-white dark:bg-gray-900'>
                <CardHeader>
                    <CardTitle>Total Digit : {singleDigits?.length || 0}</CardTitle>
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

            <Card className='bg-white dark:bg-gray-900'>
                <CardHeader>
                    <CardTitle>Total Panna : {allPanna?.length || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-10 gap-4">
                        {allPanna?.map((digitObj) => (
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

export default SingleDigit