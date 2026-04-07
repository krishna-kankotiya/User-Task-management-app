'use client';

import { useState, useEffect } from "react";
import { 
  Save, 
  Trash2, 
  Filter, 
  StickyNote, 
  Tag, 
  Clock,
  AlertCircle
} from "lucide-react";

interface NoteItem { id: number; note: string; category: string; time: string;}

interface NotesProps {
  widgetId?: string;
}

const loadNotes = (widgetId?: string): NoteItem[] => {
  if (typeof window === 'undefined') return [];
  const storageKey = widgetId ? `notes_${widgetId}` : "notes";
  const savedNotes = localStorage.getItem(storageKey);
  if (savedNotes) {
    try {
      return JSON.parse(savedNotes);
    } catch {
      return [];
    }
  }
  return [];
};

const Notes: React.FC<NotesProps> = ({ widgetId }) => {
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("general");
  const [notes, setNotes] = useState<NoteItem[]>(() => loadNotes(widgetId));
  const [filterCategory, setFilterCategory] = useState("all");
  const [isLoaded, setIsLoaded] = useState(false);

  const categories = ["common", "work", "personal"];
  const storageKey = widgetId ? `notes_${widgetId}` : "notes";

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (notes.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(notes));
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [notes, isLoaded, storageKey]);

  const handleAddNote = () => {
    if (note.trim()) {
      const newNote: NoteItem = {
        id: Date.now(),
        note: note, 
        category: category,
        time: new Date().toLocaleString()
      };
      setNotes([...notes, newNote]);
      setNote("");
      setCategory("general");
    }
  };

  const handleDelete = (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const filteredNotes = filterCategory === "all" ? notes : notes.filter(n => n.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Note Form */}
      <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
            <StickyNote className="w-3 h-3" />
            Quick Note
          </label>
          <textarea 
            value={note} 
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write something down..."
            rows={3}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              Category
            </label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleAddNote}
            className="btn-primary self-end py-2 px-4 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span className="text-xs">Save</span>
          </button>
        </div>
      </div>

      {/* Filter & List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center space-x-2">
            <span>Stored Notes</span>
          </h3>
          <div className="flex items-center space-x-2 bg-muted/50 rounded-lg px-2 py-1 border border-border">
            <Filter className="w-3 h-3 text-muted-foreground" />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold text-foreground focus:ring-0 outline-none cursor-pointer"
            >
              <option value="all">All</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 bg-muted/10 border border-dashed border-border rounded-xl">
              <p className="text-xs text-muted-foreground">No notes found in this category</p>
            </div>
          ) : (
            filteredNotes.map((n) => (
              <div key={n.id} className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-all group/note">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-foreground leading-relaxed">
                      {n.note}
                    </p>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">
                        {n.category}
                      </span>
                      <div className="flex items-center text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {n.time}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all opacity-0 group-hover/note:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;

