'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  LayoutDashboard,
  Calendar,
  RotateCcw,
  Check,
  Loader2,
  ChevronRight
} from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate: string;
  priority?: 'low' | 'medium' | 'high';
}

export default function UserDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          router.push('/login');
          return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);

        const res = await fetch('/api/tasks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  const updateTaskStatus = async (taskId: string, currentStatus: string) => {
    setProcessing(taskId);
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      
      const res = await fetch(`/api/tasks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ taskId, status: newStatus })
      });

      if (res.ok) {
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus as any } : t));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  const isMissed = (dateStr: string, status: string) => {
    return status !== 'completed' && new Date(dateStr) < new Date();
  };

  const missedTasks = tasks.filter(t => isMissed(t.dueDate, t.status));
  const pendingTasks = tasks.filter(t => t.status === 'pending' && !isMissed(t.dueDate, t.status));
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      {/* Hero Header */}
      <div className="relative bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                <LayoutDashboard className="w-3 h-3" />
                Operational Overview
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Welcome back, <br />
                <span className="text-primary">{user?.name}</span>
              </h1>
              <p className="text-muted-foreground text-lg font-medium max-w-md">
                {missedTasks.length > 0 
                  ? `You have ${missedTasks.length} legacy assignments requiring immediate resolution.`
                  : pendingTasks.length > 0 
                    ? `You are currently overseeing ${pendingTasks.length} active operations.`
                    : "Mission accomplished. All sectors are currently clear."}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:w-full lg:w-auto">
              <div className="bg-muted/30 border border-border rounded-3xl p-6 shadow-sm min-w-[140px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Efficiency</p>
                <div className="flex items-end gap-2">
                   <p className="text-3xl font-black text-foreground">{completionRate}%</p>
                   <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
                </div>
              </div>
              <div className="bg-muted/30 border border-border rounded-3xl p-6 shadow-sm min-w-[140px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Total Tasks</p>
                <p className="text-3xl font-black text-foreground">{tasks.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
          {/* Missed Tasks */}
          {missedTasks.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2 text-destructive">
                <AlertCircle className="w-6 h-6" />
                <h2 className="text-2xl font-black tracking-tight">Urgent Attention Required</h2>
              </div>
              <div className="space-y-4">
                {missedTasks.map((task) => (
                  <DashboardTaskCard key={task._id} task={task} onUpdate={updateTaskStatus} processing={processing} isOverdue={true} />
                ))}
              </div>
            </div>
          )}

          {/* Active Tasks */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-black text-foreground tracking-tight">Current Assignments</h2>
              </div>
              <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/20">
                {pendingTasks.length} In Progress
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {pendingTasks.length === 0 && missedTasks.length === 0 ? (
                <div className="bg-card border-2 border-dashed border-border p-16 rounded-[2.5rem] text-center">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-bold italic">No active assignments on the radar.</p>
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <DashboardTaskCard key={task._id} task={task} onUpdate={updateTaskStatus} processing={processing} isOverdue={false} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div>
             <div className="flex items-center gap-3 px-2 mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">Recently Concluded</h2>
             </div>
             <div className="space-y-3">
               {completedTasks.length === 0 ? (
                 <div className="bg-muted/20 border border-border p-8 rounded-3xl text-center italic text-muted-foreground text-sm font-medium">
                   No completed records yet.
                 </div>
               ) : (
                 completedTasks.map((task) => (
                   <div key={task._id} className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-emerald-500/30 transition-all group overflow-hidden relative">
                      <div className="absolute right-0 top-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors"></div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="font-bold text-foreground text-sm truncate opacity-70 group-hover:opacity-100 transition-opacity">
                            {task.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground font-medium mt-1">Concluded successfully</p>
                        </div>
                        <button 
                          onClick={() => updateTaskStatus(task._id, task.status)}
                          disabled={processing === task._id}
                          className="w-10 h-10 shrink-0 rounded-xl bg-muted text-muted-foreground hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center shadow-sm active:scale-90"
                        >
                          {processing === task._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                        </button>
                      </div>
                   </div>
                 ))
               )}
             </div>
             {completedTasks.length > 5 && (
               <button className="w-full mt-4 py-3 text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
                 View Historical Records
                 <ChevronRight className="w-4 h-4" />
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardTaskCard({ task, onUpdate, processing, isOverdue }: { 
  task: Task, 
  onUpdate: (id: string, status: string) => void, 
  processing: string | null,
  isOverdue: boolean
}) {
  return (
    <div className={`bg-card border ${isOverdue ? 'border-destructive/30 border-l-4 border-l-destructive shadow-lg shadow-destructive/5' : 'border-border'} p-6 rounded-3xl group transition-all duration-300 relative overflow-hidden`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${isOverdue ? 'bg-destructive animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-amber-500'}`}></div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'text-destructive font-black' : 'text-muted-foreground'}`}>
              {isOverdue ? 'Overdue Sector' : 'Active Mission'}
            </span>
          </div>
          <h3 className={`text-2xl font-black tracking-tight ${isOverdue ? 'text-destructive' : 'text-foreground group-hover:text-primary transition-colors'}`}>
            {task.title}
          </h3>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-xl">
            {task.description}
          </p>
          
          <div className="pt-2 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight bg-muted/50 px-2 py-1 rounded">
              <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-destructive' : 'text-primary'}`} />
              <span className={isOverdue ? 'text-destructive' : ''}>
                {new Date(task.dueDate).toLocaleString(undefined, { 
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                })}
              </span>
            </div>
            {task.priority && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {task.priority} Priority
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => onUpdate(task._id, task.status)} 
          disabled={processing === task._id} 
          className={`flex-shrink-0 w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-300 shadow-sm ${
            isOverdue 
              ? 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-white' 
              : 'bg-muted text-muted-foreground hover:bg-emerald-500 hover:text-white'
          } ${processing === task._id ? 'opacity-50 cursor-not-allowed' : 'active:scale-90 hover:shadow-lg'}`}
        >
          {processing === task._id ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-8 h-8" />}
        </button>
      </div>
      
      {/* Background visual motif */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-[0.03] transition-opacity group-hover:opacity-10 pointer-events-none ${isOverdue ? 'bg-destructive' : 'bg-primary'}`}></div>
    </div>
  );
}
