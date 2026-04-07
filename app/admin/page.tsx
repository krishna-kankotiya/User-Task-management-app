'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Clock, 
  ClipboardList, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  Activity,
  UserPlus,
  CheckCircle2
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalTasks: 0,
    completedTasks: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [usersRes, tasksRes] = await Promise.all([
          fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (usersRes.ok && tasksRes.ok) {
          const users = await usersRes.json();
          const tasks = await tasksRes.json();
          
          setStats({
            totalUsers: users.length,
            pendingUsers: users.filter((u: any) => u.status === 'pending').length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter((t: any) => t.status === 'completed').length
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { name: 'Total Members', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Pending Approvals', value: stats.pendingUsers, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Total Tasks', value: stats.totalTasks, icon: ClipboardList, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { 
      name: 'Task Completion', 
      value: stats.totalTasks ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` : '0%', 
      icon: TrendingUp, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Administrative Console</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">System Overview</h1>
          <p className="text-muted-foreground mt-1 font-medium">Real-time metrics and management tools for your enterprise.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/tasks" className="btn-primary px-6 h-12 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            Create Global Task
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
               <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
               <div className="flex items-center gap-4 mb-4 relative z-10">
                 <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                   <Icon className="w-6 h-6" />
                 </div>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.name}</p>
               </div>
               <div className="relative z-10 flex items-end justify-between">
                 <h3 className="text-3xl font-black text-foreground">{stat.value}</h3>
                 <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
                   <TrendingUp className="w-3 h-3" />
                   +12%
                 </div>
               </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Management Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/admin/users" className="flex items-center p-5 rounded-2xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mr-4 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">Manage Members</h4>
                  <p className="text-xs text-muted-foreground font-medium">Review and approve access requests</p>
                </div>
              </Link>
              <Link href="/admin/tasks" className="flex items-center p-5 rounded-2xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mr-4 group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">Assign Global Tasks</h4>
                  <p className="text-xs text-muted-foreground font-medium">Distribute workload across departments</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* System Health / Status */}
        <div className="space-y-6">
          <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Operational Status</h2>
            <div className="space-y-4">
              {stats.pendingUsers > 0 && (
                 <div className="flex items-center p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl animate-in slide-in-from-top-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-3 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                  <p className="text-sm font-bold text-amber-600 uppercase tracking-tight">{stats.pendingUsers} Security Approvals Pending</p>
                </div>
              )}
              <div className="flex items-center p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                <div className="w-2.5 h-2.5 rounded-full bg-primary mr-3"></div>
                <p className="text-sm font-bold text-primary uppercase tracking-tight">{stats.totalTasks - stats.completedTasks} Active Assignments</p>
              </div>
              <div className="flex items-center p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-3"></div>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-tight">System Integrity: 100%</p>
              </div>
            </div>
            <Link href="/admin/tasks" className="btn-secondary w-full text-center mt-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
              Comprehensive Analytics
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
