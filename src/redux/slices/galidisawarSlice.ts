import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { GalidisawarGameState } from '@/types/game';
import { IGalidisawarGame, IGalidisawarGameDay } from '@/models/GalidisawarGame';

const initialState: GalidisawarGameState = {
  games: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalCount: 0,
};

// Async thunks
export const fetchGames = createAsyncThunk(
  'galidisawar/fetchGames',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/galidisawar');
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch games';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || 'Failed to fetch games';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const createGame = createAsyncThunk(
  'galidisawar/createGame',
  async (gameData: Partial<IGalidisawarGame>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/galidisawar', gameData);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to create game';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || 'Failed to create game';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateGame = createAsyncThunk(
  'galidisawar/updateGame',
  async ({ id, gameData }: { id: string; gameData: Partial<IGalidisawarGame> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/galidisawar?id=${id}`, gameData);
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to update game';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || 'Failed to update game';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteGame = createAsyncThunk(
  'galidisawar/deleteGame',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/galidisawar?id=${id}`);
      return id;
    } catch (error: unknown) {
      let errorMessage = 'Failed to delete game';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || 'Failed to delete game';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateMarketStatus = createAsyncThunk(
  'galidisawar/updateMarketStatus',
  async (
    { id, days }: { id: string; days: IGalidisawarGameDay[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(`/api/galidisawar?id=${id}`, { days });
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to update market status';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || 'Failed to update market status';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleGameStatus = createAsyncThunk(
  'galidisawar/toggleGameStatus',
  async ({ id, is_active }: { id: string; is_active: boolean }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/galidisawar/${id}/status`, { is_active });
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to toggle game status';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || 'Failed to toggle game status';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const galidisawarSlice = createSlice({
  name: 'galidisawar',
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

export const { setCurrentPage, clearError, setTotalCount } = galidisawarSlice.actions;
export default galidisawarSlice.reducer;