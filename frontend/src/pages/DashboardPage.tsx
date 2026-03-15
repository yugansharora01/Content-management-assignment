import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { ContentItem, AuditLog, PaginatedResponse } from '@/types';
import { Card } from '@/components/ui/card';
import { FileText, TrendingUp, BarChart3, Monitor, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const CHART_COLORS = [
  'hsl(199, 89%, 48%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)'
];

const DashboardPage = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<PaginatedResponse<ContentItem>>('/content').catch(() => ({ data: [] } as any)),
      api.get<PaginatedResponse<AuditLog>>('/audit').catch(() => ({ data: [] } as any)),
    ]).then(([contentRes, auditRes]) => {
      setContent(contentRes.data || []);
      setAuditLogs(auditRes.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const totalContent = content.length;
  const publishedContent = content.filter(c => c.status === 'published').length;
  const reportsGenerated = auditLogs.filter(l => l.action === 'report_generated').length;

  // Compute content by category for pie chart
  const categoryMap: Record<string, number> = {};
  content.forEach(c => {
    const cat = (c as any).category || 'General';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const contentByCategory = Object.entries(categoryMap).map(([category, count]) => ({ category, count }));

  // Compute content created by day (last 7 days)
  const now = Date.now();
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 86400000);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
  const contentByDay = dayLabels.map(label => {
    const count = content.filter(c => {
      const d = new Date(c.createdAt);
      return `${d.getMonth() + 1}/${d.getDate()}` === label;
    }).length;
    return { date: label, count };
  });

  const statCards = [
    { label: 'Total Content', value: totalContent, icon: FileText, color: 'text-primary' },
    { label: 'Published', value: publishedContent, icon: TrendingUp, color: 'text-success' },
    { label: 'Reports Generated', value: reportsGenerated, icon: BarChart3, color: 'text-chart-4' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {user?.name || user?.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 card-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-80`} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4 card-shadow">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Content Created (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={contentByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 9%, 46%)" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4 card-shadow">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Content by Category</h3>
          {contentByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={contentByCategory} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category }) => category}>
                  {contentByCategory.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">No content yet</p>
          )}
        </Card>
      </div>

      {/* Bottom row: Activity + Devices */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4 card-shadow">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Recent Activity</h3>
          <div className="space-y-3">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate">{log.details}</p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && <p className="text-sm text-muted-foreground">No recent activity</p>}
          </div>
        </Card>

        <Card className="p-4 card-shadow">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Session Info</h3>
          <div className="space-y-3">
            {user?.devices?.map(device => (
              <div key={device.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Monitor className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{device.name}</p>
                    {device.current && (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">Current</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{device.ip} · {formatDistanceToNow(new Date(device.lastActive), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
            {!user?.devices?.length && (
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Last login: {user?.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

