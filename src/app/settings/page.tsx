'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';

import { loadSettings, SETTINGS_DEFAULTS as DEFAULTS, SETTINGS_KEY as STORAGE_KEY } from '@/lib/settings';
import type { GoalEdgeSettings } from '@/lib/settings';

const LEAGUE_OPTIONS = [
  { value: 'premier-league', label: 'Premier League' },
  { value: 'la-liga', label: 'La Liga' },
  { value: 'serie-a', label: 'Serie A' },
  { value: 'bundesliga', label: 'Bundesliga' },
  { value: 'ligue-1', label: 'Ligue 1' },
];

const CURRENCY_SYMBOLS: Record<string, string> = { GBP: '£', EUR: '€', USD: '$' };

// ─── Sub-components ───────────────────────────────────────────

function EmailTestButton() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [picks, setPicks] = useState<number | null>(null);

  async function sendTest() {
    setState('sending');
    try {
      const res = await fetch('/api/alerts/test', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setPicks(data.picks);
      setState('sent');
      setTimeout(() => setState('idle'), 5000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 4000);
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Send test alert now</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          {state === 'sent'
            ? `✓ Sent ${picks} ${picks === 1 ? 'pick' : 'picks'} to sybexdesigns@gmail.com`
            : state === 'error'
              ? '✗ Failed — check RESEND_API_KEY is set in Vercel env vars'
              : "Sends today's picks immediately to your email"}
        </p>
      </div>
      <button
        onClick={sendTest}
        disabled={state === 'sending'}
        className={`shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
          state === 'sent'
            ? 'bg-[var(--edge-green)]/15 text-[var(--edge-green)] border border-[var(--edge-green)]/30'
            : state === 'error'
              ? 'bg-[var(--edge-red)]/15 text-[var(--edge-red)] border border-[var(--edge-red)]/30'
              : 'bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
        } disabled:opacity-50`}
      >
        {state === 'sending' ? 'Sending…' : state === 'sent' ? '✓ Sent' : state === 'error' ? '✗ Error' : 'Send now'}
      </button>
    </div>
  );
}

function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="mb-5">
        <h2 className="font-display text-sm font-bold">{title}</h2>
        {description && <p className="text-xs text-[var(--text-muted)] mt-1">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>
        {hint && <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="shrink-0 w-48">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none ${
        checked ? 'bg-[var(--edge-green)]' : 'bg-[var(--surface-4)]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function NumberInput({
  value, onChange, min, max, step, prefix, suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
  prefix?: string; suffix?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {prefix && <span className="text-sm text-[var(--text-muted)] font-mono">{prefix}</span>}
      <input
        type="number"
        className="input text-right font-mono"
        style={{ width: suffix ? '80px' : '100%' }}
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={e => onChange(Number(e.target.value))}
      />
      {suffix && <span className="text-sm text-[var(--text-muted)]">{suffix}</span>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────

export default function SettingsPage() {
  const [settings, setSettings] = useState<GoalEdgeSettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function update<K extends keyof GoalEdgeSettings>(key: K, value: GoalEdgeSettings[K]) {
    setSettings(s => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function toggleLeague(league: string) {
    const current = settings.leagues;
    const next = current.includes(league)
      ? current.filter(l => l !== league)
      : [...current, league];
    if (next.length === 0) return; // must keep at least one
    update('leagues', next);
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    if (!resetConfirm) { setResetConfirm(true); return; }
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULTS);
    setResetConfirm(false);
    setSaved(false);
  }

  const sym = CURRENCY_SYMBOLS[settings.currency];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">Customise your bankroll, staking strategy, and model filters</p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              saved
                ? 'bg-[var(--edge-green)]/20 text-[var(--edge-green)] border border-[var(--edge-green)]/30'
                : 'bg-[var(--edge-green)] text-black hover:opacity-90'
            }`}
          >
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

        {/* ── Bankroll ── */}
        <Section
          title="Bankroll"
          description="Your starting capital used for stake calculations and P&L tracking."
        >
          <Field label="Starting Bankroll" hint="The total capital you're betting with.">
            <NumberInput
              value={settings.bankrollAmount}
              onChange={v => update('bankrollAmount', v)}
              min={1}
              step={10}
              prefix={sym}
            />
          </Field>

          <div className="divider" />

          <Field label="Currency">
            <select
              className="input"
              value={settings.currency}
              onChange={e => update('currency', e.target.value as GoalEdgeSettings['currency'])}
            >
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
          </Field>
        </Section>

        {/* ── Staking ── */}
        <Section
          title="Staking Strategy"
          description="How stake sizes are calculated for each bet recommendation."
        >
          <Field
            label="Staking Method"
            hint="Kelly adjusts stake based on edge size. Fixed uses the same amount every bet."
          >
            <div className="flex rounded-xl overflow-hidden border border-[var(--border-subtle)]">
              {(['kelly', 'fixed'] as const).map(method => (
                <button
                  key={method}
                  onClick={() => update('stakingMethod', method)}
                  className={`flex-1 py-2 text-xs font-bold capitalize transition-colors ${
                    settings.stakingMethod === method
                      ? 'bg-[var(--surface-3)] text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {method === 'kelly' ? 'Kelly' : 'Fixed'}
                </button>
              ))}
            </div>
          </Field>

          <div className="divider" />

          {settings.stakingMethod === 'kelly' ? (
            <>
              <Field
                label="Kelly Fraction"
                hint="Quarter Kelly (0.25) is safest. Half Kelly (0.5) is moderate. Full Kelly (1.0) is aggressive."
              >
                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    {[
                      { label: '¼ Kelly', value: 0.25 },
                      { label: '½ Kelly', value: 0.5 },
                      { label: 'Full', value: 1.0 },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => update('kellyFraction', opt.value)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          settings.kellyFraction === opt.value
                            ? 'bg-[var(--edge-green)]/15 text-[var(--edge-green)] border border-[var(--edge-green)]/30'
                            : 'bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <NumberInput
                    value={settings.kellyFraction}
                    onChange={v => update('kellyFraction', Math.min(1, Math.max(0.05, v)))}
                    min={0.05}
                    max={1}
                    step={0.05}
                    suffix="× Kelly"
                  />
                </div>
              </Field>
              <div className="divider" />
              <Field
                label="Max Stake"
                hint="Hard cap on any single bet, regardless of Kelly output."
              >
                <NumberInput
                  value={settings.maxStakePct}
                  onChange={v => update('maxStakePct', Math.min(20, Math.max(0.5, v)))}
                  min={0.5}
                  max={20}
                  step={0.5}
                  suffix="% of bankroll"
                />
              </Field>
            </>
          ) : (
            <Field
              label="Fixed Stake Amount"
              hint="Same stake placed on every bet."
            >
              <NumberInput
                value={settings.fixedStakeAmount}
                onChange={v => update('fixedStakeAmount', Math.max(0.5, v))}
                min={0.5}
                step={1}
                prefix={sym}
              />
            </Field>
          )}
        </Section>

        {/* ── Model filters ── */}
        <Section
          title="Model Filters"
          description="Control which opportunities the model surfaces as picks."
        >
          <Field
            label="Min Confidence"
            hint="Picks below this threshold are hidden from Best Picks. Default: 62%."
          >
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {[58, 62, 70, 75].map(v => (
                  <button
                    key={v}
                    onClick={() => update('minConfidence', v)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      settings.minConfidence === v
                        ? 'bg-[var(--edge-cyan)]/15 text-[var(--edge-cyan)] border border-[var(--edge-cyan)]/30'
                        : 'bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
              <NumberInput
                value={settings.minConfidence}
                onChange={v => update('minConfidence', Math.min(92, Math.max(50, v)))}
                min={50}
                max={92}
                step={1}
                suffix="%"
              />
            </div>
          </Field>

          <div className="divider" />

          <Field
            label="Min Edge"
            hint="Only surface opportunities where the model finds at least this much edge over the market."
          >
            <NumberInput
              value={settings.minEdgePct}
              onChange={v => update('minEdgePct', Math.min(15, Math.max(1, v)))}
              min={1}
              max={15}
              step={0.5}
              suffix="% edge"
            />
          </Field>

          <div className="divider" />

          <Field
            label="Leagues"
            hint="Which leagues to include in the analysis."
          >
            <div className="space-y-2">
              {LEAGUE_OPTIONS.map(l => (
                <label key={l.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => toggleLeague(l.value)}
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      settings.leagues.includes(l.value)
                        ? 'bg-[var(--edge-green)]'
                        : 'bg-[var(--surface-3)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {settings.leagues.includes(l.value) && (
                      <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 10 8" fill="currentColor">
                        <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span
                    onClick={() => toggleLeague(l.value)}
                    className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors"
                  >
                    {l.label}
                  </span>
                </label>
              ))}
            </div>
          </Field>
        </Section>

        {/* ── Alerts ── */}
        <Section
          title="Alerts & Preferences"
        >
          <Field
            label="High Confidence Only"
            hint="When enabled, Best Picks only shows 70%+ confidence opportunities."
          >
            <Toggle
              checked={settings.highConfOnly}
              onChange={v => update('highConfOnly', v)}
            />
          </Field>

          <div className="divider" />

          <Field
            label="Daily Email Alerts"
            hint="Sends today's picks to sybexdesigns@gmail.com every morning at 8 AM UTC."
          >
            <Toggle
              checked={settings.emailAlerts}
              onChange={v => update('emailAlerts', v)}
            />
          </Field>

          {settings.emailAlerts && (
            <>
              <div className="divider" />
              <EmailTestButton />
            </>
          )}
        </Section>

        {/* ── About ── */}
        <Section title="About GoalEdge">
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Version</span>
              <span className="font-mono">1.0.0-beta</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Data source</span>
              <span>football-data.org</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Model</span>
              <span>Poisson + Kelly</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Season</span>
              <span>2025/26</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Form data</span>
              <span>Last 30 days (live)</span>
            </div>
          </div>
        </Section>

        {/* ── Actions row ── */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleReset}
            className={`text-xs transition-colors ${
              resetConfirm
                ? 'text-[var(--edge-red)] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {resetConfirm ? 'Click again to confirm reset' : 'Reset to defaults'}
          </button>
          {resetConfirm && (
            <button
              onClick={() => setResetConfirm(false)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              saved
                ? 'bg-[var(--edge-green)]/20 text-[var(--edge-green)] border border-[var(--edge-green)]/30'
                : 'bg-[var(--edge-green)] text-black hover:opacity-90'
            }`}
          >
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

      </main>
    </div>
  );
}
