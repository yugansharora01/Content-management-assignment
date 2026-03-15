"use client";

import React, { useEffect } from 'react';
import { Card, CardHeader, CardBody, Divider, Button } from "@heroui/react";
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, PieChart, Bell, ArrowRight } from 'lucide-react';

export default function DashboardOverview() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  const stats = [
    { name: "Total Content", value: "24", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Reports Generated", value: "12", icon: PieChart, color: "text-purple-500", bg: "bg-purple-500/10" },
    { name: "Unread Alerts", value: "5", icon: Bell, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
        <p className="text-default-500">Welcome back, Admin. Real-time metrics from your microservices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="flex flex-row items-center gap-4 p-6">
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-small text-default-500 font-medium">{stat.name}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-4">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Recent Reports</h2>
            </div>
            <Button size="sm" variant="ghost" endContent={<ArrowRight className="w-4 h-4" />}>
              View All
            </Button>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="flex flex-col items-center justify-center h-48 text-default-400">
               <p className="text-small italic">Mocking data from report-service...</p>
               <p className="text-tiny mt-2">No reports generated today.</p>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Latest Audit Logs</h2>
            </div>
            <Button size="sm" variant="ghost" endContent={<ArrowRight className="w-4 h-4" />}>
              View Logs
            </Button>
          </CardHeader>
          <Divider />
          <CardBody>
             <div className="space-y-4 py-2">
                {[
                  { action: "User Login", user: "Admin", time: "2 mins ago" },
                  { action: "Content Created", user: "Admin", time: "1 hour ago" },
                  { action: "Report Triggered", user: "System", time: "3 hours ago" },
                ].map((log, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-divider pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-small font-semibold">{log.action}</p>
                      <p className="text-tiny text-default-500">By {log.user}</p>
                    </div>
                    <span className="text-tiny text-default-400 font-medium">{log.time}</span>
                  </div>
                ))}
             </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
