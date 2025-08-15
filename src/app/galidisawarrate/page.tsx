"use client"

import React from 'react'
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

const formSchema = z.object({
  leftDigitPoint: z.number().min(0),
  leftDigitAmount: z.number().min(0),
  rightDigitPoint: z.number().min(0),
  rightDigitAmount: z.number().min(0),
  jodiDigitPoint: z.number().min(0),
  jodiDigitAmount: z.number().min(0),
})

const GalidisawarRate = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leftDigitPoint: 100,
      leftDigitAmount: 950,
      rightDigitPoint: 100,
      rightDigitAmount: 14000,
      jodiDigitPoint: 100,
      jodiDigitAmount: 28000,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Starline rates submitted:", values)
    // Add your submission logic here
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Galidisawar Game Rates</h1>
        <p className="text-gray-600 mt-2">Configure payout rates for different game types</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6' >
          {/* Single Digit Section */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className="p-6 rounded-lg shadow border ">
            <h2 className="text-xl font-semibold  mb-4 pb-2 border-b ">
              Left Digit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="leftDigitPoint"
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
                name="leftDigitAmount"
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

          {/* Single Panna Section */}
          <div className=" p-6 rounded-lg shadow border ">
            <h2 className="text-xl font-semibold  mb-4 pb-2 border-b">
              Right Digit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="rightDigitPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium">Point Value</FormLabel>
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
                name="rightDigitAmount"
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

          {/* Double Panna Section */}
          <div className=" p-6 rounded-lg shadow border ">
            <h2 className="text-xl font-semibold  mb-4 pb-2 border-b">
              Jodi Digit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="jodiDigitPoint"
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
                name="jodiDigitAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium ">Payout Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2">₹</span>
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
            <Button 
              type="submit" 
              className="w-full md:w-auto"
            >
              Save Galidisawar Rates
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default GalidisawarRate