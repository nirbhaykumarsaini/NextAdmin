'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/hooks/redux';
import { AuthState } from '@/redux/slices/authSlice';


const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAppSelector((state: { auth: AuthState }) => state.auth)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : null
}

export default AuthGuard