'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, var(--edge-green), transparent 70%)' }}
        />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--edge-green)] to-[var(--edge-cyan)] flex items-center justify-center shadow-lg">
            <span className="font-display text-base font-bold text-black">GE</span>
          </div>
          <div className="text-center">
            <span className="font-display text-xl font-bold tracking-tight">Set new password</span>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">GoalEdge · AI Football Intelligence</p>
          </div>
        </div>

        <div className="card border-[var(--border-default)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-xs block mb-1.5">New password</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="input"
              />
            </div>
            <div>
              <label className="label-xs block mb-1.5">Confirm password</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="input"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-[var(--edge-red)]/10 border border-[var(--edge-red)]/25 px-3 py-2.5">
                <p className="text-xs text-[var(--edge-red)]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold bg-[var(--edge-green)] text-black hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
