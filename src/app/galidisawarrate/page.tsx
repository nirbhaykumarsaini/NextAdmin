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

const formSchema = z.object({
  left_digit_point: z.number().min(0),
  left_digit_amount: z.number().min(0),
  right_digit_point: z.number().min(0),
  right_digit_amount: z.number().min(0),
  jodi_digit_point: z.number().min(0),
  jodi_digit_amount: z.number().min(0),
});

interface RateData {
  _id: string;
  left_digit_point: number;
  left_digit_amount: number;
  right_digit_point: number;
  right_digit_amount: number;
  jodi_digit_point: number;
  jodi_digit_amount: number;

}

const GalidisawarRate = () => {

  const [rateId, setRateId] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      left_digit_point: 0,
      left_digit_amount: 0,
      right_digit_point: 0,
      right_digit_amount: 0,
      jodi_digit_point: 0,
      jodi_digit_amount: 0,
    },
  })

  useEffect(() => {
    fetchRate()
  }, [])

  const fetchRate = async () => {
    try {
      const response = await axios.get('/api/galidisawarrate')
      console.log(response.data)

      if (response.data.status && response.data.data) {
        const rateData: RateData = response.data.data;
        setRateId(rateData._id);

        // Set form values with API data
        form.reset({
          left_digit_point: rateData.left_digit_point,
          left_digit_amount: rateData.left_digit_amount,
          right_digit_point: rateData.right_digit_point,
          right_digit_amount: rateData.right_digit_amount,
          jodi_digit_point: rateData.jodi_digit_point,
          jodi_digit_amount: rateData.jodi_digit_amount,
        });
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to fatch rate`)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    try {
      const response = await axios.post('/api/galidisawarrate', {
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
                  name="left_digit_point"
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
                  name="left_digit_amount"
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
                  name="right_digit_point"
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
                  name="right_digit_amount"
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