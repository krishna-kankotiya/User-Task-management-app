'use client';

import React, { useState, useEffect } from "react";
import GridLayout, { Layout, LayoutItem } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Task from "../(dashboard)/task/page";
import Notes from "../(dashboard)/notes/page";
import { Plus, X, ListTodo, FileText, LayoutGrid } from "lucide-react";

type WidgetLayout = { i: string; x: number; y: number; w: number; h: number; type: string };

const DashboardGrid: React.FC = () => {
  const [layout, setLayout] = useState<WidgetLayout[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("layout");
      if (saved) return JSON.parse(saved);
    }
    // Default to a sensible starting layout if none exists
    return [
      { i: "1", x: 0, y: 0, w: 6, h: 8, type: "task" },
      { i: "2", x: 6, y: 0, w: 6, h: 8, type: "notes" }
    ];
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    localStorage.setItem("layout", JSON.stringify(layout));
  }, [layout]);

  if (!mounted) return null;

  const addWidget = (type: string) => {
    const newWidget: WidgetLayout = {
      i: Date.now().toString(), 
      x: (layout.length * 6) % 12, 
      y: Infinity, // put it at bottom
      w: 6, 
      h: 8, 
      type,
    };
    setLayout((prev) => [...prev, newWidget]);
  };

  const deleteWidget = (id: string) => {
    setLayout((prev) => prev.filter((item) => item.i !== id));
  };

  const handleLayoutChange = (newLayout: Layout) => {
    const updatedLayout: WidgetLayout[] = [...newLayout].map((item) => {
      const existing = layout.find((l) => l.i === item.i);
      return { 
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        type: existing?.type || "task",
      };
    });
    setLayout(updatedLayout);
  };

  const renderComponent = (item: WidgetLayout) => {
    switch (item.type) {
      case "task":
        return <Task widgetId={item.i} />;
      case "notes":
        return <Notes widgetId={item.i} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header/Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LayoutGrid className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Personal Workspace</h1>
            <p className="text-xs text-muted-foreground">Manage your widgets and daily focus</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => addWidget("task")}
            className="btn-secondary py-2 px-4 text-xs flex items-center space-x-2 flex-1 sm:flex-none"
          >
            <ListTodo className="w-4 h-4" />
            <span>Add Task</span>
          </button>
          <button 
            onClick={() => addWidget("notes")}
            className="btn-secondary py-2 px-4 text-xs flex items-center space-x-2 flex-1 sm:flex-none"
          >
            <FileText className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="relative -mx-2">
        <GridLayout 
          className="layout" 
          layout={layout} 
          cols={12} 
          rowHeight={40} 
          width={1200}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".widget-drag-handle"
          margin={[16, 16]}
        >
          {layout.map((item) => (
            <div key={item.i} className="card-standard !p-0 overflow-hidden flex flex-col group">
              <div className="widget-drag-handle flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30 cursor-move">
                <div className="flex items-center space-x-2">
                  {item.type === "task" ? <ListTodo className="w-3.5 h-3.5 text-primary" /> : <FileText className="w-3.5 h-3.5 text-amber-500" />}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {item.type} Widget
                  </span>
                </div>
                <button 
                  onClick={() => deleteWidget(item.i)}
                  className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                {renderComponent(item)}
              </div>
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
};

export default DashboardGrid;

