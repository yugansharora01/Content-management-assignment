import type {
  User, ContentItem, AuditLog, Report, Notification, DashboardStats, Device
} from '@/types';

// Mock delay
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const mockUser: User = {
  id: '1',
  email: 'admin@cms.dev',
  name: 'Alex Morgan',
  role: 'admin',
  lastLogin: new Date(Date.now() - 3600000).toISOString(),
  devices: [
    { id: '1', name: 'Chrome on MacOS', browser: 'Chrome 120', ip: '192.168.1.10', lastActive: new Date().toISOString(), current: true },
    { id: '2', name: 'Firefox on Windows', browser: 'Firefox 121', ip: '10.0.0.5', lastActive: new Date(Date.now() - 7200000).toISOString(), current: false },
  ],
};

const mockContent: ContentItem[] = [
  { id: '1', title: 'Getting Started with Microservices', body: 'A comprehensive guide to building microservice architectures...', status: 'published', author: 'Alex Morgan', createdAt: '2026-03-10T10:00:00Z', updatedAt: '2026-03-12T14:30:00Z', category: 'Engineering' },
  { id: '2', title: 'Redis Caching Best Practices', body: 'Learn how to effectively use Redis for caching in production...', status: 'published', author: 'Alex Morgan', createdAt: '2026-03-08T09:00:00Z', updatedAt: '2026-03-08T09:00:00Z', category: 'DevOps' },
  { id: '3', title: 'Docker Compose for Development', body: 'Setting up multi-container development environments...', status: 'draft', author: 'Alex Morgan', createdAt: '2026-03-14T16:00:00Z', updatedAt: '2026-03-14T16:00:00Z', category: 'DevOps' },
  { id: '4', title: 'CI/CD Pipeline Design', body: 'Building robust deployment pipelines with Jenkins...', status: 'archived', author: 'Alex Morgan', createdAt: '2026-02-20T11:00:00Z', updatedAt: '2026-03-01T08:00:00Z', category: 'Engineering' },
  { id: '5', title: 'API Gateway Patterns', body: 'Common patterns for API gateway implementations...', status: 'published', author: 'Alex Morgan', createdAt: '2026-03-05T13:00:00Z', updatedAt: '2026-03-06T10:00:00Z', category: 'Architecture' },
];

const mockAuditLogs: AuditLog[] = [
  { id: '1', action: 'user_login', user: 'Alex Morgan', details: 'Logged in from Chrome on MacOS', timestamp: new Date().toISOString(), ip: '192.168.1.10' },
  { id: '2', action: 'content_created', user: 'Alex Morgan', details: 'Created "Docker Compose for Development"', timestamp: new Date(Date.now() - 3600000).toISOString(), ip: '192.168.1.10' },
  { id: '3', action: 'content_updated', user: 'Alex Morgan', details: 'Updated "Getting Started with Microservices"', timestamp: new Date(Date.now() - 7200000).toISOString(), ip: '192.168.1.10' },
  { id: '4', action: 'report_generated', user: 'Alex Morgan', details: 'Generated User Activity Report', timestamp: new Date(Date.now() - 86400000).toISOString(), ip: '192.168.1.10' },
  { id: '5', action: 'content_created', user: 'Alex Morgan', details: 'Created "API Gateway Patterns"', timestamp: new Date(Date.now() - 172800000).toISOString(), ip: '192.168.1.10' },
  { id: '6', action: 'user_login', user: 'Alex Morgan', details: 'Logged in from Firefox on Windows', timestamp: new Date(Date.now() - 259200000).toISOString(), ip: '10.0.0.5' },
];

const mockReports: Report[] = [
  { id: '1', name: 'User Activity Report - March', type: 'user_activity', status: 'completed', createdAt: '2026-03-14T10:00:00Z', downloadUrl: '#' },
  { id: '2', name: 'Content Statistics Q1', type: 'content_stats', status: 'completed', createdAt: '2026-03-10T08:00:00Z', downloadUrl: '#' },
  { id: '3', name: 'System Activity Log', type: 'system_activity', status: 'generating', createdAt: '2026-03-15T06:00:00Z' },
];

const mockNotifications: Notification[] = [
  { id: '1', type: 'content_created', title: 'Content Created', message: '"Docker Compose for Development" has been created', read: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', type: 'report_generated', title: 'Report Ready', message: 'User Activity Report is ready to download', read: false, timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', type: 'login_alert', title: 'New Login', message: 'New login detected from Firefox on Windows', read: true, timestamp: new Date(Date.now() - 86400000).toISOString() },
];

const mockStats: DashboardStats = {
  totalContent: 5,
  publishedContent: 3,
  totalUsers: 12,
  reportsGenerated: 8,
  contentByDay: [
    { date: '03/09', count: 0 }, { date: '03/10', count: 1 }, { date: '03/11', count: 0 },
    { date: '03/12', count: 2 }, { date: '03/13', count: 1 }, { date: '03/14', count: 3 }, { date: '03/15', count: 1 },
  ],
  contentByCategory: [
    { category: 'Engineering', count: 12 }, { category: 'DevOps', count: 8 },
    { category: 'Architecture', count: 5 }, { category: 'Design', count: 3 },
  ],
  recentActivity: mockAuditLogs.slice(0, 5),
};

// Mock API implementations — swap with real api calls when backend is ready
export const mockApi = {
  auth: {
    login: async (email: string, _password: string) => {
      await delay(800);
      if (email === 'admin@cms.dev') {
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        return { token: 'mock-jwt-token', user: mockUser };
      }
      throw new Error('Invalid credentials');
    },
    logout: async () => {
      await delay(300);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    },
    getUser: (): User | null => {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    },
    isAuthenticated: () => !!localStorage.getItem('auth_token'),
  },
  content: {
    list: async (): Promise<ContentItem[]> => { await delay(500); return [...mockContent]; },
    get: async (id: string): Promise<ContentItem> => {
      await delay(300);
      const item = mockContent.find(c => c.id === id);
      if (!item) throw new Error('Not found');
      return { ...item };
    },
    create: async (data: Partial<ContentItem>): Promise<ContentItem> => {
      await delay(500);
      const item: ContentItem = {
        id: String(mockContent.length + 1), title: data.title || '', body: data.body || '',
        status: 'draft', author: 'Alex Morgan', category: data.category || 'General',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      mockContent.push(item);
      return item;
    },
    update: async (id: string, data: Partial<ContentItem>): Promise<ContentItem> => {
      await delay(500);
      const idx = mockContent.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Not found');
      mockContent[idx] = { ...mockContent[idx], ...data, updatedAt: new Date().toISOString() };
      return mockContent[idx];
    },
    delete: async (id: string): Promise<void> => {
      await delay(300);
      const idx = mockContent.findIndex(c => c.id === id);
      if (idx !== -1) mockContent.splice(idx, 1);
    },
  },
  audit: {
    list: async (): Promise<AuditLog[]> => { await delay(400); return [...mockAuditLogs]; },
  },
  reports: {
    list: async (): Promise<Report[]> => { await delay(400); return [...mockReports]; },
    generate: async (type: Report['type']): Promise<Report> => {
      await delay(1000);
      const report: Report = {
        id: String(mockReports.length + 1),
        name: `${type.replace('_', ' ')} Report`,
        type, status: 'completed',
        createdAt: new Date().toISOString(),
        downloadUrl: '#',
      };
      mockReports.push(report);
      return report;
    },
  },
  notifications: {
    list: async (): Promise<Notification[]> => { await delay(300); return [...mockNotifications]; },
    markRead: async (id: string): Promise<void> => {
      await delay(200);
      const n = mockNotifications.find(n => n.id === id);
      if (n) n.read = true;
    },
    markAllRead: async (): Promise<void> => {
      await delay(200);
      mockNotifications.forEach(n => n.read = true);
    },
  },
  dashboard: {
    stats: async (): Promise<DashboardStats> => { await delay(500); return { ...mockStats }; },
  },
};
