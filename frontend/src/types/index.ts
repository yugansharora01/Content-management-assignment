export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  lastLogin: string;
  devices: Device[];
}

export interface Device {
  id: string;
  name: string;
  browser: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  body: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  createdAt: string;
  updatedAt: string;
  category: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
  ip: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'user_activity' | 'content_stats' | 'system_activity';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  downloadUrl?: string;
}

export interface Notification {
  id: string;
  type: 'content_created' | 'report_generated' | 'login_alert' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface DashboardStats {
  totalContent: number;
  publishedContent: number;
  totalUsers: number;
  reportsGenerated: number;
  contentByDay: { date: string; count: number }[];
  contentByCategory: { category: string; count: number }[];
  recentActivity: AuditLog[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
