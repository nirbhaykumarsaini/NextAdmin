// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { redirect } from 'next/navigation'

export interface User {
  id: string
  username: string
  role: 'admin' | 'user'
  // Add other user properties as needed
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  status: boolean
  message: string
  user: User
  accessToken: string
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post<LoginResponse>('/api/auth/login', credentials)
      const result = response.data

      if (!result.status) {
        return rejectWithValue(result.message || 'Login failed')
      }

      localStorage.setItem('accessToken', result.accessToken)
      return result
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      return rejectWithValue(errorMessage)
    }
  }
)

// Async thunk for logout - fixed to handle redirect properly
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Optional: Call your logout API endpoint if you have one
      // await axios.post('/api/auth/logout');
      
      localStorage.removeItem('accessToken');
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action: PayloadAction<{
      user: User
      accessToken: string
    }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
    },
    initializeAuth: (state) => {
      const accessToken = localStorage.getItem('accessToken')

      if (accessToken) {
        state.accessToken = accessToken
        state.isAuthenticated = true
        // Note: You might want to fetch user data here or store it in localStorage
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
        state.error = null
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, setCredentials, initializeAuth } = authSlice.actions
export default authSlice.reducer