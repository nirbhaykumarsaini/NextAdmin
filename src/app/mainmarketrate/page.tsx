"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Define the schema for form validation
const formSchema = z.object({
    singleDigitPoint: z.number().min(0),
    singleDigitAmount: z.number().min(0),
    jodiDigitPoint: z.number().min(0),
    jodiDigitAmount: z.number().min(0),
    singlePannaPoint: z.number().min(0),
    singlePannaAmount: z.number().min(0),
    doublePannaPoint: z.number().min(0),
    doublePannaAmount: z.number().min(0),
    triplePannaPoint: z.number().min(0),
    triplePannaAmount: z.number().min(0),
    halfSangamPoint: z.number().min(0),
    halfSangamAmount: z.number().min(0),
    fullSangamPoint: z.number().min(0),
    fullSangamAmount: z.number().min(0),
})

const MainMarketRate = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            singleDigitPoint: 10,
            singleDigitAmount: 100,
            jodiDigitPoint: 10,
            jodiDigitAmount: 1000,
            singlePannaPoint: 10,
            singlePannaAmount: 1600,
            doublePannaPoint: 10,
            doublePannaAmount: 3200,
            triplePannaPoint: 10,
            triplePannaAmount: 1000,
            halfSangamPoint: 10,
            halfSangamAmount: 10000,
            fullSangamPoint: 10,
            fullSangamAmount: 0,
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Form submitted:", values)
        // Here you would typically send the data to your API
    }

    return (
        <div className="container ">
            <h1 className="text-2xl font-bold mb-6">Main Market Game Rates</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Single Digit */}
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-semibold mb-3">Single Digit</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="singleDigitPoint"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Point</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="singleDigitAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Jodi Digit */}
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-semibold mb-3">Jodi Digit</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="jodiDigitPoint"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Point</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="jodiDigitAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Single Panna */}
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-semibold mb-3">Single Panna</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="singlePannaPoint"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Point</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="singlePannaAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Double Panna */}
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-semibold mb-3">Double Panna</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="doublePannaPoint"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Point</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="doublePannaAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Triple Panna */}
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-semibold mb-3">Triple Panna</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="triplePannaPoint"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Point</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="triplePannaAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Half Sangam */}
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-semibold mb-3">Half Sangam</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="halfSangamPoint"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Point</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="halfSangamAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Full Sangam */}
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-semibold mb-3">Full Sangam</h3>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="fullSangamPoint"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Point</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fullSangamAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        className="w-24"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </FormControl>
                                            </div>
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