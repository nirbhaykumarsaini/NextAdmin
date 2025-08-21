'use client'

import { SigninForm } from '@/components/auth/SigninForm'

export default function AuthPage() {
  

  return (
    <div className="min-h-screen flex justify-center items-center p-4">
      <div className="w-full max-w-md">
          <SigninForm 
          />
      </div>
    </div>
  )
}