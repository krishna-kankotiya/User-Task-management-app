'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Users, 
  UserPlus, 
  ChevronDown, 
  ChevronUp, 
  ClipboardList, 
  Calendar, 
  Clock, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Activity,
  ArrowRight,
  ShieldAlert,
  Loader2,
  X
} from "lucide-react";

interface UserInfo {
  _id: string;
  name: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: UserInfo[];
  status: 'pending' | 'completed';
  dueDate: string;
}

interface User {
  _id: string;
  name: string;
  status: string;
  position: string;
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [newUserPosition, setNewUserPosition] = useState<'Frontend' | 'Backend' | 'Designer' | 'Fullstack'>('Frontend');
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [tasksRes, usersRes] = await Promise.all([
        fetch('/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (tasksRes.ok && usersRes.ok) {
        const tasksData = await tasksRes.json();
        const usersData = await usersRes.json();
        setTasks(tasksData);
        setUsers(usersData.filter((u: User) => u.status === 'approved'));
      }
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assignedTo.length === 0) {
      alert('Please select at least one member');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, assignedTo, dueDate }),
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setAssignedTo([]);
        setDueDate('');
        fetchData();
      }
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          position: newUserPosition
        }),
      });

      if (res.ok) {
        const newUser = await res.json();
        setUsers(prev => [newUser, ...prev]);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setShowAddUser(false);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasks(tasks.filter(t => t._id !== taskId));
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setAssignedTo(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const isMissed = (dateStr: string, status: string) => {
    return status !== 'completed' && new Date(dateStr) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  const missedTasks = tasks.filter(t => isMissed(t.dueDate, t.status));
  const pendingTasks = tasks.filter(t => t.status === 'pending' && !isMissed(t.dueDate, t.status));
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-10 animate-in fade-in duration-500 mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Global Operations</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Command center for organizational task orchestration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Member Add */}
          <div className={`bg-card border ${showAddUser ? 'border-primary/30' : 'border-border'} rounded-2xl overflow-hidden transition-all duration-300 shadow-sm`}>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="w-full flex items-center justify-between p-6 group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${showAddUser ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'} flex items-center justify-center transition-colors`}>
                  <UserPlus className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Rapid Onboarding</h2>
              </div>
              {showAddUser ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>

            {showAddUser && (
              <form onSubmit={handleCreateUser} className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <input 
                    type="text" required value={newUserName} onChange={(e) => setNewUserName(e.target.value)} 
                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    placeholder="Full Name" 
                  />
                  <input 
                    type="email" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} 
                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    placeholder="Email Address" 
                  />
                  <input 
                    type="password" required value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} 
                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    placeholder="Secure Password" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Frontend', 'Backend', 'Designer', 'Fullstack'].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setNewUserPosition(pos as any)}
                      className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${newUserPosition === pos ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                        }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>

                <button 
                  type="submit" 
                  disabled={creatingUser} 
                  className="btn-primary w-full h-11 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {creatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Register & Approve
                </button>
              </form>
            )}
          </div>

          {/* Create Task Form */}
          <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                 <ClipboardList className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Task Assignment</h2>
            </div>
            
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary h-12 transition-all outline-none"
                  placeholder="e.g. Infrastructure Scalability Review"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Detailed Briefing</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-none"
                  placeholder="Provide comprehensive details and objectives..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Personnel Allocation</label>
                <div className="max-h-56 overflow-y-auto custom-scrollbar border border-border rounded-2xl p-2 space-y-1 bg-muted/10">
                  {users.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-muted-foreground italic">No Active Personnel Found</p>
                    </div>
                  ) : (
                    users.map(u => (
                      <label key={u._id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${assignedTo.includes(u._id) ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50 border border-transparent'}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={assignedTo.includes(u._id)}
                            onChange={() => toggleUserSelection(u._id)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <div>
                            <span className="text-sm font-bold text-foreground block">{u.name}</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{u.position}</span>
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 px-2">
                   <p className="text-[10px] text-muted-foreground font-bold italic">{assignedTo.length} operators selected</p>
                   {assignedTo.length > 0 && <button type="button" onClick={() => setAssignedTo([])} className="text-[10px] text-destructive font-black uppercase hover:underline">Reset</button>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Operational Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input 
                    type="datetime-local" 
                    required value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                    className="w-full bg-muted/20 border border-border rounded-xl pl-12 pr-4 h-12 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="btn-primary w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                Initiate Assignment
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-12">
          {/* Missed Tasks */}
          {missedTasks.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Critical Breaches</h2>
                </div>
                <span className="px-3 py-1 bg-destructive/10 text-destructive text-[10px] font-black rounded-full uppercase tracking-widest border border-destructive/20">{missedTasks.length} Overdue</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {missedTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onDelete={handleDeleteTask} isOverdue={true} />
                ))}
              </div>
            </div>
          )}

          {/* Active Tasks */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Activity className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Active Deployments</h2>
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-4 py-1.5 rounded-full">{pendingTasks.length} Operational</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {pendingTasks.length === 0 && missedTasks.length === 0 ? (
                <div className="bg-card border-2 border-dashed border-border p-16 rounded-3xl text-center">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-bold">All sectors are currently clear.</p>
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onDelete={handleDeleteTask} isOverdue={false} />
                ))
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Mission Success</h2>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20">{completedTasks.length} Concluded</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4 opacity-70 hover:opacity-100 transition-opacity">
              {completedTasks.length === 0 ? (
                <div className="bg-card border border-border p-8 rounded-3xl text-center italic text-muted-foreground text-sm font-medium">
                  No conclude operations documented.
                </div>
              ) : (
                completedTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onDelete={handleDeleteTask} isOverdue={false} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, onDelete, isOverdue }: { task: Task, onDelete: (id: string) => void, isOverdue: boolean }) {
  const isCompleted = task.status === 'completed';
  
  return (
    <div className={`bg-card border ${isOverdue ? 'border-destructive/30 border-l-4 border-l-destructive' : 'border-border'} p-6 rounded-2xl transition-all duration-300 relative group overflow-hidden shadow-sm hover:shadow-md`}>
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
              isCompleted ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
              isOverdue ? 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse' : 
              'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}>
              {isOverdue ? 'System Breach (Overdue)' : task.status}
            </span>
            <div className="flex -space-x-2">
              {task.assignedTo?.slice(0, 4).map((u) => (
                <div key={u._id} title={u.name} className="h-8 w-8 rounded-xl ring-2 ring-card bg-primary text-[10px] font-black text-primary-foreground flex items-center justify-center uppercase shadow-sm">
                  {u.name.charAt(0)}
                </div>
              ))}
              {task.assignedTo && task.assignedTo.length > 4 && (
                <div className="h-8 w-8 rounded-xl ring-2 ring-card bg-muted text-[10px] font-black text-muted-foreground flex items-center justify-center uppercase">
                  +{task.assignedTo.length - 4}
                </div>
              )}
            </div>
          </div>
          
          <h3 className={`text-xl font-bold tracking-tight mb-2 ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>{task.title}</h3>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-2xl mb-6">{task.description}</p>

          <div className="flex flex-wrap items-center gap-6">
             <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className={`w-4 h-4 ${isOverdue ? 'text-destructive' : ''}`} />
                <span className={`text-[11px] font-bold uppercase tracking-tight ${isOverdue ? 'text-destructive' : ''}`}>
                  {new Date(task.dueDate).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
             </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-tight">{task.assignedTo?.length || 0} Operatives Assigned</span>
             </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onDelete(task._id)}
            className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90"
            title="Purge Task"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-muted-foreground hover:bg-muted rounded-xl transition-all">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Visual Decor */}
      <div className={`absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none ${
        isCompleted ? 'bg-emerald-500' :
        isOverdue ? 'bg-destructive' : 'bg-primary'
      }`}></div>
    </div>
  );
}
