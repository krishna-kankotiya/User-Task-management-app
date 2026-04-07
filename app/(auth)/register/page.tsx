'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '../../services/authService';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Code,
  Database,
  Palette,
  Layers
} from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [position, setPosition] = useState<'Frontend' | 'Backend' | 'Designer' | 'Fullstack'>('Frontend');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password, role, position });
      setSuccess('Registration successful! Your account is pending admin approval.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const positions = [
    { label: 'Frontend', icon: Code },
    { label: 'Backend', icon: Database },
    { label: 'Designer', icon: Palette },
    { label: 'Fullstack', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      
      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">TaskFlow</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Create your account</h1>
          <p className="text-muted-foreground mt-2 font-medium">Join high-performance teams worldwide</p>
        </div>

        <div className="bg-card border border-border p-8 rounded-2xl shadow-xl space-y-6">
          {error && (
            <div className="flex items-center space-x-3 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="font-bold">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-6 py-8 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Awaiting Approval</h3>
                <p className="text-muted-foreground font-medium leading-relaxed max-w-xs mx-auto">
                  {success}
                </p>
              </div>
              <Link href="/login" className="btn-primary inline-flex items-center space-x-2 px-8 py-3 rounded-xl text-sm font-bold">
                <span>Continue to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Professional Role</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {positions.map((pos) => {
                    const Icon = pos.icon;
                    return (
                      <button 
                        key={pos.label} 
                        type="button" 
                        onClick={() => setPosition(pos.label as any)} 
                        className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all duration-200 group ${
                          position === pos.label 
                            ? 'bg-primary/5 border-primary text-primary' 
                            : 'bg-background border-border text-muted-foreground hover:border-muted-foreground/30'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 transition-transform ${position === pos.label ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">{pos.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <User className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      required 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-foreground font-medium text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      placeholder="John Doe" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-foreground font-medium text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      placeholder="name@company.com" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type="password" 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-foreground font-medium text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type="password" 
                      required 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-foreground font-medium text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <div className="pt-6 border-t border-border text-center">
              <p className="text-muted-foreground text-sm font-medium">
                Already have an account? {' '}
                <Link href="/login" className="text-foreground font-bold hover:text-primary transition-colors hover:underline underline-offset-4">
                  Log in here
                </Link>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-8 uppercase tracking-[0.2em] font-bold">
          &copy; 2024 TaskFlow Technologies Inc.
        </p>
      </div>
    </div>
  );
}
