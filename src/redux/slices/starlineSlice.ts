import { StarlineGameState } from '@/types/game';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';


const initialState: StarlineGameState = {
  games: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalCount: 0,
};

// Async thunks
export const fetchGames = createAsyncThunk(
  'starline/fetchGames',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/starline');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createGame = createAsyncThunk(
  'starline/createGame',
  async (gameData: Partial<StarlineGameState>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/starline', gameData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateGame = createAsyncThunk(
  'starline/updateGame',
  async ({ id, gameData }: { id: string; gameData: Partial<StarlineGameState> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/starline?id=${id}`, gameData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteGame = createAsyncThunk(
  'starline/deleteGame',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/starline?id=${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMarketStatus = createAsyncThunk(
  'starline/updateMarketStatus',
  async (
    { id, days }: { id: string; days: any[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(`/api/starline?id=${id}`, {days});
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleGameStatus = createAsyncThunk(
  'starline/toggleGameStatus',
  async ({ id, is_active }: { id: string; is_active: boolean }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/starline/${id}/status`, { is_active });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const starlineSlice = createSlice({
  name: 'starline',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setTotalCount: (state, action: PayloadAction<number>) => {
      state.totalCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch games
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload.data || [];
        state.totalCount = action.payload?.totalCount || 0;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create game
      .addCase(createGame.fulfilled, (state, action) => {
        if (action.payload.data) {
          state.games.push(action.payload);
          state.totalCount += 1;
        }
      })
      // Update game
      .addCase(updateGame.fulfilled, (state, action) => {
        if (action.payload.data) {
          const index = state.games.findIndex(game => game._id === action.payload?._id);
          if (index !== -1) {
            state.games[index] = action.payload.data;
          }
        }
      })
      // Delete game
      .addCase(deleteGame.fulfilled, (state, action) => {
        state.games = state.games.filter(game => game._id !== action.payload);
        state.totalCount -= 1;
      })
      // Update market status
      .addCase(updateMarketStatus.fulfilled, (state, action) => {
        if (action.payload.data) {
          const index = state.games.findIndex(game => game._id === action.payload?._id);
          if (index !== -1) {
            state.games[index] = action.payload;
          }
        }
      })
      // Toggle game status
      .addCase(toggleGameStatus.fulfilled, (state, action) => {
        if (action.payload.data) {
          const index = state.games.findIndex(game => game._id === action.payload?._id);
          if (index !== -1) {
            state.games[index] = action.payload;
          }
        }
      });
  },
});

export const { setCurrentPage, clearError, setTotalCount } = starlineSlice.actions;
export default starlineSlice.reducer;