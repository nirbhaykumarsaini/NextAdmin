// components/ProtectedRoute.tsx - Enhanced version
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/hooks/redux'

export const ProtectedRoute = ({ 
  children, 
}: { 
  children: React.ReactNode
}) => {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
    
    // if (!isLoading && isAuthenticated ) {
    //   router.push('/unauthorized')
    // }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : null
}