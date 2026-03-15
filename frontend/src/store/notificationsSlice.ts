import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@/types';
import { api } from '@/services/api';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get<Notification[]>('/notifications');
    } catch {
      return rejectWithValue('Failed to load notifications');
    }
  }
);

export const markNotificationReadThunk = createAsyncThunk(
  'notifications/markRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.put(`/notifications/${id}/read`);
      return id;
    } catch {
      return rejectWithValue('Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsReadThunk = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { notifications: NotificationsState };
      const unread = state.notifications.notifications.filter((n) => !n.read);
      await Promise.all(unread.map((n) => api.put(`/notifications/${n._id}/read`)));
      return true;
    } catch {
      return rejectWithValue('Failed to mark all as read');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(markNotificationReadThunk.fulfilled, (state, action: PayloadAction<string>) => {
        const n = state.notifications.find((n) => n._id === action.payload);
        if (n && !n.read) {
          n.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
        state.notifications.forEach((n) => (n.read = true));
        state.unreadCount = 0;
      });
  },
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
