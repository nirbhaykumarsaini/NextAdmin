"use client"

import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { toast } from 'sonner'

// Define the schema for form validation
const formSchema = z.object({
    single_digit_point: z.number().min(0),
    single_digit_amount: z.number().min(0),
    jodi_digit_point: z.number().min(0),
    jodi_digit_amount: z.number().min(0),
    single_panna_point: z.number().min(0),
    single_panna_amount: z.number().min(0),
    double_panna_point: z.number().min(0),
    double_panna_amount: z.number().min(0),
    triple_panna_point: z.number().min(0),
    triple_panna_amount: z.number().min(0),
    half_sangam_point: z.number().min(0),
    half_sangam_amount: z.number().min(0),
    full_sangam_point: z.number().min(0),
    full_sangam_amount: z.number().min(0),
})

interface RateData {
    _id: string;
    single_digit_point: number;
    single_digit_amount: number;
    jodi_digit_point: number;
    jodi_digit_amount: number;
    single_panna_point: number;
    single_panna_amount: number;
    double_panna_point: number;
    double_panna_amount: number;
    triple_panna_point: number;
    triple_panna_amount: number;
    half_sangam_point: number;
    half_sangam_amount: number;
    full_sangam_point: number;
    full_sangam_amount: number;
}

const MainMarketRate = () => {

    const [rateId, setRateId] = useState<string>("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            single_digit_point: 0,
            single_digit_amount: 0,
            jodi_digit_point: 0,
            jodi_digit_amount: 0,
            single_panna_point: 0,
            single_panna_amount: 0,
            double_panna_point: 0,
            double_panna_amount: 0,
            triple_panna_point: 0,
            triple_panna_amount: 0,
            half_sangam_point: 0,
            half_sangam_amount: 0,
            full_sangam_point: 0,
            full_sangam_amount: 0,
        },
    })

    useEffect(() => {
        fetchRate()
    }, [])

    const fetchRate = async () => {
        try {
            const response = await axios.get('/api/mainmarketrate')
            console.log(response.data)

            if (response.data.status && response.data.data) {
                const rateData: RateData = response.data.data;
                setRateId(rateData._id);

                // Set form values with API data
                form.reset({
                    single_digit_point: rateData.single_digit_point,
                    single_digit_amount: rateData.single_digit_amount,
                    jodi_digit_point: rateData.jodi_digit_point,
                    jodi_digit_amount: rateData.jodi_digit_amount,
                    single_panna_point: rateData.single_panna_point,
                    single_panna_amount: rateData.single_panna_amount,
                    double_panna_point: rateData.double_panna_point,
                    double_panna_amount: rateData.double_panna_amount,
                    triple_panna_point: rateData.triple_panna_point,
                    triple_panna_amount: rateData.triple_panna_amount,
                    half_sangam_point: rateData.half_sangam_point,
                    half_sangam_amount: rateData.half_sangam_amount,
                    full_sangam_point: rateData.full_sangam_point,
                    full_sangam_amount: rateData.full_sangam_amount,
                });
            }
        } catch (error: any) {
            toast.error(error.message || `Failed to  fatch rate`)
        }
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {

        try {
            const response = await axios.post('/api/mainmarketrate', {
                id: rateId,
                rateData: values
            })
            console.log(response.data)
            if (response.data.status === false) {
                toast.error(response.data.message || `Failed to  ${rateId ? "update" : "add"} rate`)
            } else {
                toast.success(response.data.message || `Rate ${rateId ? "updated" : "added"} successfully`);
                fetchRate()
            }
        } catch (error: any) {
            toast.error(error.message || `Failed to  ${rateId ? "update" : "add"} rate`)
        }
    }

    return (
        <div className="container ">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Main Market Game Rates</h1>
                <p className="text-gray-600 mt-2">Configure payout rates for different game types</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Single Digit */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className="p-6 rounded-lg shadow border ">
                            <h2 className="text-xl font-semibold  mb-4 pb-2 border-b ">
                                Single Digit
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="single_digit_point"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Point Value</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="pl-3 pr-10 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="single_digit_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Payout Amount</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 ">₹</span>
                                                    <Input
                                                        type="number"
                                                        className="pl-8 pr-3 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Jodi Digit */}
                        <div className="border p-6 rounded-lg">
                            <h3 className="text-xl font-semibold  mb-4 pb-2 border-b ">Jodi Digit</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="jodi_digit_point"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Point Value</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="pl-3 pr-10 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="jodi_digit_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Payout Amount</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 ">₹</span>
                                                    <Input
                                                        type="number"
                                                        className="pl-8 pr-3 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Single Panna */}
                        <div className="border p-6 rounded-lg">
                            <h3 className="text-xl font-semibold  mb-4 pb-2 border-b ">Single Panna</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="single_panna_point"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Point Value</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="pl-3 pr-10 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="single_panna_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Payout Amount</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 ">₹</span>
                                                    <Input
                                                        type="number"
                                                        className="pl-8 pr-3 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Double Panna */}
                        <div className="border p-6 rounded-lg">
                            <h3 className="text-xl font-semibold  mb-4 pb-2 border-b ">Double Panna</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="double_panna_point"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Point Value</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="pl-3 pr-10 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="double_panna_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Payout Amount</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 ">₹</span>
                                                    <Input
                                                        type="number"
                                                        className="pl-8 pr-3 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Triple Panna */}
                        <div className="border p-6 rounded-lg">
                            <h3 className="text-xl font-semibold  mb-4 pb-2 border-b ">Triple Panna</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="triple_panna_point"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Point Value</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="pl-3 pr-10 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="triple_panna_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Payout Amount</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 ">₹</span>
                                                    <Input
                                                        type="number"
                                                        className="pl-8 pr-3 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Half Sangam */}
                        <div className="border p-6 rounded-lg">
                            <h3 className="text-xl font-semibold  mb-4 pb-2 border-b ">Half Sangam</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="full_sangam_point"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Point Value</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="pl-3 pr-10 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="full_sangam_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Payout Amount</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 ">₹</span>
                                                    <Input
                                                        type="number"
                                                        className="pl-8 pr-3 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Full Sangam */}
                        <div className="border p-6 rounded-lg">
                            <h3 className="text-xl font-semibold  mb-4 pb-2 border-b ">Full Sangam</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="half_sangam_point"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Point Value</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        className="pl-3 pr-10 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="half_sangam_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium ">Payout Amount</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 ">₹</span>
                                                    <Input
                                                        type="number"
                                                        className="pl-8 pr-3 py-3 text-lg font-medium"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" className="w-full md:w-auto">
                            Save Rates
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default MainMarketRate