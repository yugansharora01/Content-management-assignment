import React, { createContext, useContext, useCallback, useEffect } from 'react';
import type { User, Notification } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginThunk, logoutThunk } from '@/store/authSlice';
import {
  fetchNotifications,
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
  clearNotifications,
} from '@/store/notificationsSlice';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  notifications: Notification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  // Read auth and notification state from Redux store
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isLoading = useAppSelector((s) => s.auth.isLoading);
  const notifications = useAppSelector((s) => s.notifications.notifications);
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await dispatch(loginThunk({ email, password }));
      if (loginThunk.rejected.match(result)) {
        throw new Error((result.payload as string) || 'Login failed');
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutThunk());
    dispatch(clearNotifications());
  }, [dispatch]);

  const refreshNotifications = useCallback(async () => {
    await dispatch(fetchNotifications());
  }, [dispatch]);

  const markNotificationRead = useCallback(
    async (id: string) => {
      await dispatch(markNotificationReadThunk(id));
    },
    [dispatch]
  );

  const markAllNotificationsRead = useCallback(async () => {
    await dispatch(markAllNotificationsReadThunk());
  }, [dispatch]);

  // Load notifications whenever user logs in
  useEffect(() => {
    if (user) refreshNotifications();
  }, [user, refreshNotifications]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        notifications,
        unreadCount,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
