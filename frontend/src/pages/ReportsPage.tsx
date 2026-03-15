import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Report } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, FileBarChart } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const statusStyles: Record<string, string> = {
  completed: 'bg-success/10 text-success border-success/20',
  generating: 'bg-warning/10 text-warning border-warning/20',
  pending: 'bg-muted text-muted-foreground border-border',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
};

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<Report['type']>('user_activity');

  const load = async () => { 
    setLoading(true);
    try {
      const data = await api.get<Report[]>('/reports');
      setReports(data);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/reports/generate', { type: reportType });
      toast.success('Report generation started');
      setTimeout(load, 3000); // reload after a short delay
    } catch (e: any) {
      toast.error(e.message || 'Failed to start report generation');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">Generate and download reports</p>
      </div>

      <Card className="p-4 card-shadow">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Generate New Report</h3>
        <div className="flex items-end gap-3">
          <div className="flex-1 max-w-xs">
            <Select value={reportType} onValueChange={v => setReportType(v as Report['type'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user_activity">User Activity</SelectItem>
                <SelectItem value="content_stats">Content Statistics</SelectItem>
                <SelectItem value="system_activity">System Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileBarChart className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid gap-3">
          {reports.map((report, i) => (
            <motion.div key={report._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="flex items-center justify-between p-4 card-shadow">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">{report.name}</h3>
                    <Badge variant="outline" className={statusStyles[report.status]}>{report.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">Created {new Date(report.createdAt).toLocaleDateString()}</p>
                </div>
                {report.status === 'completed' && (
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/reports/download/${report._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />Download PDF
                    </Button>
                  </a>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
