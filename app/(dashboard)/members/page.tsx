'use client';

import React, { useState, useEffect } from "react";
import { getAllUsers, updateUserRole } from "../../services/userService";
import { createTask } from "../../services/taskService";
import { getCurrentUser, isAdmin } from "../../services/authService";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  Edit3, 
  Mail, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Send,
  MoreVertical,
  Search
} from "lucide-react";

interface Member {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

interface LocalMember {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface TaskForm {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [localMembers, setLocalMembers] = useState<LocalMember[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("members");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskForm>({ title: "", description: "", priority: "medium", dueDate: "" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();

  useEffect(() => { fetchMembers(); }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("members", JSON.stringify(localMembers));
    }
  }, [localMembers]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setMembers(await getAllUsers());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email");
      return;
    }
    if (editId) {
      setLocalMembers(localMembers.map(m => m.id === editId ? { ...m, name, email, role } : m));
      setEditId(null);
      setSuccess("Member updated successfully");
    } else {
      setLocalMembers([...localMembers, { id: Date.now(), name, email, role }]);
      setSuccess("Member added successfully");
    }
    setName("");
    setEmail("");
    setRole("");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEdit = (member: LocalMember) => {
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setEditId(member.id);
  };

  const handleDelete = (id: number) => {
    setLocalMembers(localMembers.filter(m => m.id !== id));
    setSuccess("Member deleted successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setName("");
    setEmail("");
    setRole("");
  };

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    try {
      await updateUserRole(userId, newRole);
      setMembers(members.map(m => m._id === userId ? { ...m, role: newRole } : m));
      setSuccess("Role updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleAssignTask = (userId: string) => {
    setSelectedUser(userId);
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await createTask({ ...taskForm, assignedTo: selectedUser });
      setSuccess("Task assigned successfully");
      setShowTaskModal(false);
      setTaskForm({ title: "", description: "", priority: "medium", dueDate: "" });
      setSelectedUser(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign task");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground mt-1">Manage institutional roles and local team members</p>
        </div>
        {userIsAdmin && (
          <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Admin Access Enabled</span>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {error && (
          <div className="bg-destructive text-destructive-foreground p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
            <button onClick={() => setError("")} className="ml-auto hover:bg-white/10 p-1 rounded-md transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{success}</span>
            <button onClick={() => setSuccess("")} className="ml-auto hover:bg-white/10 p-1 rounded-md transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Member Form Section */}
        <div className="xl:col-span-1">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm sticky top-8">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <UserPlus className="w-5 h-5" />
              <h2 className="text-lg font-bold text-foreground">{editId ? "Edit Team Member" : "Add Team Member"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sarah Jenkins" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="sarah@company.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Professional Role</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value)} 
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="">Select specialisation...</option>
                  <option value="frontend">Frontend Developer</option>
                  <option value="backend">Backend Developer</option>
                  <option value="designer">UI/UX Designer</option>
                  <option value="fullstack">Fullstack Engineer</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  {editId ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editId ? "Update Member" : "Create Member"}
                </button>
                {editId && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="bg-muted hover:bg-muted/80 text-foreground px-4 rounded-xl text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Members Lists Section */}
        <div className="xl:col-span-2 space-y-10">
          {/* Local Members List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Local Team Contacts
              </h3>
              <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase">{localMembers.length} Members</span>
            </div>
            
            {localMembers.length === 0 ? (
              <div className="text-center py-12 bg-muted/10 border border-dashed border-border rounded-2xl">
                <p className="text-sm text-muted-foreground italic">No local members added yet. Use the form to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localMembers.map(member => (
                  <div key={member.id} className="bg-card border border-border p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{member.name}</h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(member)}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)}
                          className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg text-muted-foreground transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-muted rounded text-foreground">
                        {member.role}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">ID: {member.id.toString().slice(-4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Institutional Members List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Institutional Directory
              </h3>
            </div>
            
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Employee</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Access Role</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Joined On</th>
                      {userIsAdmin && <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {members.map(member => (
                      <tr key={member._id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">
                                {member.name} {member._id === currentUser?._id && <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded ml-1 font-bold">YOU</span>}
                              </p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {userIsAdmin && member._id !== currentUser?._id ? (
                            <select 
                              value={member.role} 
                              onChange={e => handleRoleChange(member._id, e.target.value as "user" | "admin")}
                              className="bg-muted/50 border border-border rounded-md text-xs font-bold px-2 py-1 outline-none focus:ring-1 focus:ring-primary/30"
                            >
                              <option value="user">User</option>
                              <option value="admin">Administrator</option>
                            </select>
                          ) : (
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${member.role === 'admin' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-muted text-muted-foreground'}`}>
                              {member.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                          {new Date(member.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        {userIsAdmin && (
                          <td className="px-6 py-4 text-right">
                            {member._id !== currentUser?._id && (
                              <button 
                                onClick={() => handleAssignTask(member._id)}
                                className="btn-secondary py-1 text-[10px] flex items-center gap-1.5 ml-auto font-bold"
                              >
                                <Plus className="w-3 h-3" />
                                Assign Priority
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Task Assignment Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in" onClick={() => setShowTaskModal(false)}></div>
          <div className="bg-card w-full max-w-lg border border-border shadow-2xl rounded-3xl relative z-10 animate-in zoom-in-95 overflow-hidden">
            <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Send className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Assign New Directive</h3>
                  <p className="text-xs text-muted-foreground italic">Target Subject ID: #{selectedUser?.slice(-6)}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTaskModal(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleTaskSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Task Title</label>
                <input 
                  type="text" 
                  value={taskForm.title} 
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} 
                  required 
                  placeholder="Define the primary objective..." 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Operational Parameters</label>
                <textarea 
                  value={taskForm.description} 
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} 
                  required 
                  rows={4} 
                  placeholder="Detail the scope and requirements..." 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none font-medium"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Priority Level</label>
                  <select 
                    value={taskForm.priority} 
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as "low" | "medium" | "high" })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer font-bold"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">Critical High</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Deadline</label>
                  <input 
                    type="date" 
                    value={taskForm.dueDate} 
                    onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-muted rounded-2xl transition-all border border-border"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary flex-1 py-4 text-xs font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

