import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, Notification } from '@/types';
import { api } from '@/services/api';

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
  const storedUser = localStorage.getItem('user');
  const [user, setUser] = useState<User | null>(() => {
    try {
      return storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Backend returns { _id, email, role, token } flat — not { user, token }
      const res = await api.post<{ _id: string; email: string; role: string; token: string }>('/auth/login', { email, password });
      const { token, ...userFields } = res;
      const userObj = userFields as unknown as User;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore errors on logout
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      setNotifications([]);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await api.get<Notification[]>('/notifications');
      setNotifications(data);
    } catch {
      // Notifications are non-critical; don't crash the app
    }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => api.put(`/notifications/${n.id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    if (user) refreshNotifications();
  }, [user, refreshNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading, login, logout,
      notifications, unreadCount, refreshNotifications,
      markNotificationRead, markAllNotificationsRead,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
