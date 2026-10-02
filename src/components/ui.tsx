'use client';
import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Inbox, Loader2, X } from 'lucide-react';
import { ACCOUNT, CONDITION, INVITATION, MAINT, ROLE_TONE, STATUS, Tone } from '@/lib/constants';

export const cn = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

/* ---------- buttons ---------- */
const variants = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700',
  secondary: 'bg-white text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
};
const sizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-3.5 py-2 text-sm' };
export const btn = (v: keyof typeof variants = 'primary', s: keyof typeof sizes = 'md') =>
  cn('inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50', variants[v], sizes[s]);

export function Button({ variant = 'primary', size = 'md', loading, children, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; size?: keyof typeof sizes; loading?: boolean }) {
  return (
    <button {...p} disabled={p.disabled || loading} className={cn(btn(variant, size), className)}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

/* ---------- badges ---------- */
const tones: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  dark: 'bg-slate-800 text-slate-100 ring-slate-900/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
};
const dots: Record<Tone, string> = { green: 'bg-emerald-500', amber: 'bg-amber-500', blue: 'bg-blue-500', red: 'bg-red-500', slate: 'bg-slate-400', dark: 'bg-slate-300', violet: 'bg-violet-500', indigo: 'bg-indigo-500' };
export const toneDot = dots;

export function Badge({ tone = 'slate', dot, children }: { tone?: Tone; dot?: boolean; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', tones[tone])}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dots[tone])} />}
      {children}
    </span>
  );
}
export const StatusBadge = ({ v }: { v: string }) => <Badge tone={STATUS[v]?.tone} dot>{STATUS[v]?.label ?? v}</Badge>;
export const ConditionBadge = ({ v }: { v: string }) => <Badge tone={CONDITION[v]?.tone}>{CONDITION[v]?.label ?? v}</Badge>;
export const RoleBadge = ({ v }: { v: string }) => <Badge tone={ROLE_TONE[v] ?? 'slate'}>{v}</Badge>;
export const InvitationBadge = ({ v }: { v: string }) => <Badge tone={INVITATION[v]?.tone}>{INVITATION[v]?.label ?? v}</Badge>;
export const AccountBadge = ({ v }: { v: string }) => <Badge tone={ACCOUNT[v]?.tone} dot>{ACCOUNT[v]?.label ?? v}</Badge>;
export function MaintBadge({ m }: { m?: { state: string; daysUntil: number | null } }) {
  if (!m) return null;
  const c = MAINT[m.state];
  const extra = m.state === 'OVERDUE' ? ` by ${Math.abs(m.daysUntil!)}d` : m.state === 'DUE_SOON' ? ` in ${m.daysUntil}d` : '';
  return <Badge tone={c.tone} dot>{c.label}{extra}</Badge>;
}

/* ---------- layout primitives ---------- */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Field({ label, error, hint, children, className }: { label: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500" role="status">
      <Loader2 className="h-5 w-5 animate-spin text-brand-600" /> {label}…
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-brand-50 p-3 text-brand-600"><Inbox className="h-6 w-6" /></div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const c = { error: 'bg-red-50 text-red-800 ring-red-200', success: 'bg-emerald-50 text-emerald-800 ring-emerald-200', info: 'bg-brand-50 text-brand-900 ring-brand-200' }[tone];
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle;
  return <div className={cn('flex items-start gap-2 rounded-lg px-3.5 py-3 text-sm ring-1 ring-inset', c)} role="alert"><Icon className="mt-0.5 h-4 w-4 shrink-0" /><div>{children}</div></div>;
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}
        className={cn('max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-pop sm:rounded-2xl', wide ? 'max-w-2xl' : 'max-w-lg')}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Pagination({ meta, onChange }: { meta?: { page: number; totalPages: number; total: number; pageSize: number }; onChange: (p: number) => void }) {
  if (!meta || meta.total === 0) return null;
  const from = (meta.page - 1) * meta.pageSize + 1;
  const to = Math.min(meta.total, meta.page * meta.pageSize);
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
      <span>Showing <b className="font-semibold text-slate-700">{from}–{to}</b> of <b className="font-semibold text-slate-700">{meta.total}</b></span>
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="sm" disabled={meta.page <= 1} onClick={() => onChange(meta.page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
        <span className="px-2 text-xs">Page {meta.page} of {meta.totalPages}</span>
        <Button variant="secondary" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => onChange(meta.page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 font-semibold text-white', size === 'lg' ? 'h-14 w-14 text-lg' : 'h-9 w-9 text-xs')}>
      {name}
    </span>
  );
}

export function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{children || '—'}</dd>
    </div>
  );
}

/* ---------- toasts ---------- */
type T = { id: number; type: 'success' | 'error'; msg: string };
let listeners: ((t: T) => void)[] = [];
let seq = 0;
const emit = (type: T['type'], msg: string) => listeners.forEach((l) => l({ id: ++seq, type, msg }));
export const toast = { success: (m: string) => emit('success', m), error: (m: string) => emit('error', m) };

export function Toaster() {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    const l = (t: T) => { setItems((x) => [...x, t]); setTimeout(() => setItems((x) => x.filter((i) => i.id !== t.id)), 4500); };
    listeners.push(l);
    return () => { listeners = listeners.filter((x) => x !== l); };
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-start gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-pop">
          {t.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}
