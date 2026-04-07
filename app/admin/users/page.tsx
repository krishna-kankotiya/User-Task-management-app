'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Check, 
  X, 
  UserMinus, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  MoreVertical,
  Mail,
  Loader2
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId: string, status: string) => {
    setError('');
    setProcessing(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: status as any } : u));
      } else {
        const data = await res.json();
        setError(data.error || `Failed to update user to ${status}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('A network error occurred while updating status.');
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Review and manage organizational access requests.</p>
        </div>
        <div className="bg-card border border-border px-4 py-2 rounded-xl shadow-sm flex items-center space-x-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            {users.filter(u => u.status === 'approved').length} Active
          </div>
          <div className="h-4 w-px bg-border"></div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            {users.filter(u => u.status === 'pending').length} Pending
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 text-destructive animate-in slide-in-from-top-2">
          <XCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Member Identity</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Permissions</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-sm shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{user.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 font-medium">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                      user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'bg-muted text-muted-foreground'
                    }`}>
                      {user.role === 'admin' ? <Shield className="w-3 h-3" /> : null}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      user.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : 
                      user.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {user.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                      {user.status === 'pending' && <Clock className="w-3 h-3 mr-1.5 animate-spin-slow" />}
                      {user.status === 'rejected' && <XCircle className="w-3 h-3 mr-1.5" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(user._id, 'approved')} 
                            disabled={processing === user._id} 
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-90 disabled:opacity-50"
                            title="Approve Member"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(user._id, 'rejected')} 
                            disabled={processing === user._id} 
                            className="bg-destructive hover:bg-destructive/80 text-white p-2 rounded-lg shadow-lg shadow-destructive/20 transition-all active:scale-90 disabled:opacity-50"
                            title="Reject Member"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {user.role !== 'admin' && user.status === 'approved' && (
                        <button 
                          onClick={() => handleUpdateStatus(user._id, 'rejected')} 
                          disabled={processing === user._id} 
                          className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/10 rounded-lg transition-all active:scale-90 disabled:opacity-50"
                          title="Revoke Access"
                        >
                          <UserMinus className="w-5 h-5" />
                        </button>
                      )}
                      <button className="text-muted-foreground hover:bg-muted p-2 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
