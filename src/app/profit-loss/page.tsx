import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Link from 'next/link'
import React from 'react'
import { FiArrowRight } from 'react-icons/fi'

const page = () => {
    return (
        <div>
            <Card className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
                    <p className="text-sm font-medium text-muted-foreground">
                        Total Loss
                    </p>
                    <div className="h-4 w-4 text-muted-foreground">
                        <FiArrowRight className="h-5 w-5 ml-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
                    </div>
                </CardHeader>
                <CardContent className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-bold">23</div>
                        <p className={`text-xs mt-1 flex items-center ${false ? 'text-red-500' : 'text-green-500'}`}>
                            48.5
                            {/* {negative ? (
              <FiArrowDown className="h-3 w-3 ml-1" />
            ) : (
              <FiArrowUp className="h-3 w-3 ml-1" />
            )} */}
                        </p>
                    </div>
                    {/* <Link href={link}>
          <FiArrowRight className="h-5 w-5 ml-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
        </Link> */}
                </CardContent>
            </Card>
        </div>
    )
}

export default page