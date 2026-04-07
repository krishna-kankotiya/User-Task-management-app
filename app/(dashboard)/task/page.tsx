'use client';

import { useState, useEffect } from "react";
import { getAllUsers } from "../../services/userService";
import { createTask, getAllTasks, deleteTask } from "../../services/taskService";
import { getCurrentUser, isAdmin } from "../../services/authService";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Users,
  Search,
  ClipboardList
} from "lucide-react";

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface TaskItem {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  dueDate?: string;
  assignedTo: { _id: string; name: string; email: string };
  assignedBy: { _id: string; name: string; email: string };
  createdAt: string;
}

interface TaskProps {
  widgetId?: string;
}

const Task: React.FC<TaskProps> = ({ widgetId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const localMembersData = localStorage.getItem("members");
      const localMembers = localMembersData ? JSON.parse(localMembersData) : [];
      const formattedLocalMembers: Member[] = localMembers.map((m: any) => ({
        _id: `local_${m.id}`,
        name: m.name,
        email: m.email,
        role: m.role,
      }));

      let apiMembers: Member[] = [];
      try {
        apiMembers = await getAllUsers();
      } catch (err) {
        console.log("Could not fetch API members, using only local members");
      }

      if (currentUser) {
        const currentUserExists = apiMembers.some(m => m._id === currentUser._id) ||
                                  formattedLocalMembers.some(m => m.email === currentUser.email);
        if (!currentUserExists) {
          apiMembers.push({
            _id: currentUser._id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
          });
        }
      }

      setAvailableMembers([...apiMembers, ...formattedLocalMembers]);

      if (userIsAdmin) {
        try {
          setTasks(await getAllTasks());
        } catch (err) {
          console.log("Could not fetch tasks");
        }
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }
    if (selectedMembers.length === 0) {
      setError("Please select at least one member");
      return;
    }

    try {
      const taskPromises = selectedMembers.map((memberId) => {
        if (memberId.startsWith('local_')) return Promise.resolve();
        return createTask({
          title,
          description,
          priority,
          dueDate: dueDate || undefined,
          assignedTo: memberId,
        });
      });

      await Promise.all(taskPromises);
      setSuccess(`Task assigned to ${selectedMembers.length} member(s) successfully`);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setSelectedMembers([]);

      if (userIsAdmin) {
        try {
          setTasks(await getAllTasks());
        } catch (err) {
          console.log("Could not refresh tasks");
        }
      }
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t._id !== id));
      setSuccess("Task deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleMemberToggle = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === availableMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(availableMembers.map((m) => m._id));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Creation Form */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center space-x-2">
          <span>Assign New Task</span>
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
          <div className="space-y-1">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="Task Title" 
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
              rows={2} 
              placeholder="Full description..." 
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="space-y-1">
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Target Members</label>
              <button 
                type="button" 
                onClick={handleSelectAll}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                {selectedMembers.length === availableMembers.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="max-h-32 overflow-auto bg-background/50 border border-border rounded-lg p-2 space-y-1 custom-scrollbar">
              {availableMembers.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic text-center py-2">No members available</p>
              ) : (
                availableMembers.map((member) => (
                  <label key={member._id} className="flex items-center p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors group">
                    <input 
                      type="checkbox" 
                      checked={selectedMembers.includes(member._id)} 
                      onChange={() => handleMemberToggle(member._id)} 
                      className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 bg-background"
                    />
                    <div className="ml-3">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{member.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-2 flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </form>
      </section>

      {/* Task List */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center space-x-2">
          <span>Current Pipeline</span>
        </h3>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 bg-muted/10 border border-dashed border-border rounded-xl">
              <ClipboardList className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No active tasks found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task._id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all group/task">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground leading-tight">{task.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                          task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">#{task._id.slice(-4)}</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleDelete(task._id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all opacity-0 group-hover/task:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                  <div className="grid grid-cols-2 gap-y-3 pt-4 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-foreground">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-foreground capitalize">
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 col-span-2">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                        {task.assignedTo ? task.assignedTo.name.charAt(0) : '?'}
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        Assigned to <span className="text-foreground font-bold">{task.assignedTo ? task.assignedTo.name : "Unassigned"}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};


export default Task;

