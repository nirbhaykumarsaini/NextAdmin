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
  singleDigitPoint: z.number().min(0),
  singleDigitAmount: z.number().min(0),
  singlePannaPoint: z.number().min(0),
  singlePannaAmount: z.number().min(0),
  doublePannaPoint: z.number().min(0),
  doublePannaAmount: z.number().min(0),
  triplePannaPoint: z.number().min(0),
  triplePannaAmount: z.number().min(0),
})

const StarlineRate = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      singleDigitPoint: 100,
      singleDigitAmount: 950,
      singlePannaPoint: 100,
      singlePannaAmount: 14000,
      doublePannaPoint: 100,
      doublePannaAmount: 28000,
      triplePannaPoint: 100,
      triplePannaAmount: 70000,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Starline rates submitted:", values)
    // Add your submission logic here
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Starline Game Rates</h1>
        <p className="text-gray-600 mt-2">Configure payout rates for different game types</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6' >
          {/* Single Digit Section */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className="p-6 rounded-lg shadow border ">
            <h2 className="text-xl font-semibold  mb-4 pb-2 border-b ">
              Single Digit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="singleDigitPoint"
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
                name="singleDigitAmount"
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
              Single Panna
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="singlePannaPoint"
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
                name="singlePannaAmount"
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
              Double Panna
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="doublePannaPoint"
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
                name="doublePannaAmount"
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

          {/* Triple Panna Section */}
          <div className=" p-6 rounded-lg shadow border ">
            <h2 className="text-xl font-semibold  mb-4 pb-2 border-b ">
              Triple Panna
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="triplePannaPoint"
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
                name="triplePannaAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium">Payout Amount</FormLabel>
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
              Save Starline Rates
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default StarlineRate