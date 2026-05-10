'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get('error') === 'confirmation_failed') {
      setError('Email confirmation failed or link expired. Please try signing up again.');
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Email confirmation is off — sign in directly
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: 'signin' | 'signup') {
    setMode(m);
    setError('');
    setSuccess('');
  }

  return (
    <div className="card border-[var(--border-default)]">
      {/* Mode tabs */}
      <div className="flex mb-6 bg-[var(--surface-2)] rounded-xl p-1 gap-1">
        {(['signin', 'signup'] as const).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-[var(--surface-4)] text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {m === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-xs block mb-1.5">Email address</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input"
          />
        </div>

        <div>
          <label className="label-xs block mb-1.5">Password</label>
          <input
            type="password"
            required
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
            minLength={6}
            className="input"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-[var(--edge-red)]/10 border border-[var(--edge-red)]/25 px-3 py-2.5">
            <p className="text-xs text-[var(--edge-red)]">{error}</p>
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-[var(--edge-green)]/10 border border-[var(--edge-green)]/25 px-3 py-2.5">
            <p className="text-xs text-[var(--edge-green)]">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold bg-[var(--edge-green)] text-black hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
        >
          {loading ? '…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-xs text-[var(--text-muted)] mt-5">
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
          className="text-[var(--edge-green)] hover:opacity-80 transition-opacity"
        >
          {mode === 'signin' ? 'Create one' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, var(--edge-green), transparent 70%)' }}
        />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--edge-green)] to-[var(--edge-cyan)] flex items-center justify-center shadow-lg">
            <span className="font-display text-base font-bold text-black">GE</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight">GoalEdge</span>
              <span className="badge badge-blue text-[10px]">BETA</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">AI Football Intelligence</p>
          </div>
        </div>

        {/* Suspense needed for useSearchParams */}
        <Suspense fallback={<div className="card border-[var(--border-default)] py-12" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          Your data is private and secured with Supabase Auth.
        </p>
      </div>
    </div>
  );
}
