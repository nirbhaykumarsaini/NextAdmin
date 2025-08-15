'use client'

import { useState } from 'react'
import { SigninForm } from '@/components/auth/SigninForm'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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