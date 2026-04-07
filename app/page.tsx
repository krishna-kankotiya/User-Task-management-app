'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/services/authService';
import { CheckCircle, BarChart3, Users, Zap } from 'lucide-react';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Strict logout on landing page entry to ensure fresh login
    logout();
    setIsAuthenticated(false);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden font-sans selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="nav-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">TaskFlow</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-4">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">Sign In</Link>
              <Link href="/register" className="btn-primary py-2 px-5">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-bold mb-6 border border-primary/20">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary"></span>
            <span>Next Gen Productivity Platform</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] mb-6 tracking-tight">
            Streamline your workflow <br className="hidden sm:block" />
            <span className="text-primary italic">without the friction</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-medium mb-10 leading-relaxed max-w-2xl mx-auto">
            Empower your team with a task management system built for high-performance organizations. 
            Reliable, secure, and lightning-fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="btn-primary w-full sm:w-auto text-base px-8 py-3.5 shadow-lg shadow-primary/20">
              Start Your Free Trial
            </Link>
            <Link href="/login" className="btn-secondary w-full sm:w-auto text-base px-8 py-3.5">
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 md:py-32 px-4 sm:px-6 bg-muted/50 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything you need to deliver</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Focus on what matters. We'll handle the organization.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {[
              { title: 'Workflow Mastery', desc: 'Customizable statuses and intuitive interfaces for peak efficiency.', icon: Zap, color: 'text-amber-500' },
              { title: 'Team Synergy', desc: 'Secure member approval systems and role-based access for seamless collaboration.', icon: Users, color: 'text-primary' },
              { title: 'Data Intelligence', desc: 'Real-time analytics and visualizations to track your organization\'s output.', icon: BarChart3, color: 'text-emerald-500' }
            ].map((f, i) => (
              <div key={i} className="card-standard flex flex-col items-start text-left p-8">
                <div className={`mb-6 p-3 rounded-lg bg-background border border-border shadow-sm`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-foreground p-8 sm:p-16 text-center text-background relative overflow-hidden">
           <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">
             Experience the future of <br /> productivity today.
           </h2>
           <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-background px-8 py-4 text-lg font-bold text-foreground transition-transform hover:scale-105 active:scale-95 shadow-xl">
             Get Started for Free
           </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">TaskFlow</span>
          </div>
          <div className="flex flex-col items-center sm:items-end">
            <p className="text-muted-foreground text-sm font-medium mb-1">Developed with Excellence</p>
            <p className="text-muted-foreground/60 text-xs italic">
              © {new Date().getFullYear()} TaskFlow. Shaping the future of productivity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

