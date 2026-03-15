import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { AuditLog, PaginatedResponse } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { LogIn, FilePlus, FileEdit, FileBarChart } from 'lucide-react';

const actionIcons: Record<string, typeof LogIn> = {
  user_login: LogIn,
  content_created: FilePlus,
  content_updated: FileEdit,
  report_generated: FileBarChart,
};

const actionColors: Record<string, string> = {
  user_login: 'bg-primary/10 text-primary',
  content_created: 'bg-success/10 text-success',
  content_updated: 'bg-warning/10 text-warning',
  report_generated: 'bg-chart-4/10 text-chart-4',
};

const AuditPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PaginatedResponse<AuditLog>>('/audit')
      .then(res => { 
        setLogs(res.data || []); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Track all system activity</p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid gap-2">
          {logs.map((log, i) => {
            const Icon = actionIcons[log.action] || FilePlus;
            const colorClass = actionColors[log.action] || 'bg-muted text-muted-foreground';
            return (
              <motion.div key={log.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="flex items-center gap-4 p-4 card-shadow">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{log.details}</p>
                    <p className="text-xs text-muted-foreground">{log.user} · {log.ip}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {log.action.replace('_', ' ')}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};


export default AuditPage;
