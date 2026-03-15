import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, FileText, BarChart3, LogIn, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const typeIcons: Record<string, typeof Bell> = {
  content_created: FileText,
  report_generated: BarChart3,
  login_alert: LogIn,
  system: Info,
};

const typeColors: Record<string, string> = {
  content_created: 'bg-success/10 text-success',
  report_generated: 'bg-primary/10 text-primary',
  login_alert: 'bg-warning/10 text-warning',
  system: 'bg-muted text-muted-foreground',
};

const NotificationsPage = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />Mark all read
          </Button>
        )}
      </div>

      <div className="grid gap-2">
        {notifications.map((n, i) => {
          const Icon = typeIcons[n.type] || Bell;
          const colorClass = typeColors[n.type] || 'bg-muted text-muted-foreground';
          return (
            <motion.div key={n.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card
                className={`flex cursor-pointer items-center gap-4 p-4 card-shadow transition-colors hover:bg-secondary/50 ${!n.read ? 'border-l-2 border-l-primary' : ''}`}
                onClick={() => !n.read && markNotificationRead(n.id)}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {!n.read && <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">New</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                </p>
              </Card>
            </motion.div>
          );
        })}
        {notifications.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No notifications</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
