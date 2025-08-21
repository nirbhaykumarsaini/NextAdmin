// app/providers.tsx
'use client'

import { Provider } from 'react-redux'
import { store } from '@/redux/store/store'
import { useEffect } from 'react'
import { initializeAuth } from '@/redux/slices/authSlice'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize auth state from cookies on app load
    store.dispatch(initializeAuth())
  }, [])

  return <Provider store={store}>{children}</Provider>
}