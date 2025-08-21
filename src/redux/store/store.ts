// store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/redux/slices/authSlice';
import mainMarketReducer from '@/redux/slices/mainMarketSlice';
import starlineReducer from '@/redux/slices/starlineSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    mainMarket: mainMarketReducer,
    starline:starlineReducer
  },
  middleware: (getDefaultMiddleware: (arg0: { serializableCheck: { ignoredActions: string[] } }) => any) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch