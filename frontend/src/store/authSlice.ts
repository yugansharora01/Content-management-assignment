import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';
import { api } from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const storedUser = localStorage.getItem('user');
const initialUser: User | null = (() => {
  try {
    return storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
})();

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
  isLoading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post<{ _id: string; email: string; role: string; token: string }>(
        '/auth/login',
        { email, password }
      );
      const { token, ...userFields } = res;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userFields));
      return userFields as unknown as User;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch {
    // ignore errors on logout
  } finally {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
