


import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { FiActivity } from 'react-icons/fi'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Button } from '../ui/button'

interface RecentActivityProps {
    recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    amount: number;
    time: string;
  }>;
}

const RecentActivity = ({recentActivity} : RecentActivityProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800 relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiActivity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 ">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{item.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.user} {item.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ₹{item.amount} • {item.time}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
             {recentActivity.length > 0 && <Button variant="ghost" className="absolute text-center  bottom-2 cursor-pointer">
                View all activity
              </Button>}
            </CardContent>
          </Card>
  )
}

export default RecentActivity