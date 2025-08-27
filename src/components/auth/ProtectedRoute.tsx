// components/ProtectedRoute.tsx - Enhanced version
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/hooks/redux'
import { hasPermission } from '@/redux/slices/authSlice'

export const ProtectedRoute = ({ 
  children, 
  requiredPermission 
}: { 
  children: React.ReactNode
  requiredPermission?: string
}) => {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
    
    if (!isLoading && isAuthenticated && requiredPermission && !hasPermission(user)) {
      router.push('/unauthorized')
    }
  }, [isAuthenticated, isLoading, router, requiredPermission, user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (requiredPermission && !hasPermission(user)) {
    return null
  }

  return isAuthenticated ? <>{children}</> : null
}