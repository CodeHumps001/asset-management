import React from 'react';
import { Boxes, ClipboardCheck, History, ShieldCheck, Wrench } from 'lucide-react';

export function Logo({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-900/30"><Boxes className="h-5 w-5" /></span>
      <span className={`text-[15px] font-semibold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>ICT Asset Manager</span>
    </div>
  );
}

const points = [
  { icon: ClipboardCheck, t: 'One register for every device', d: 'Computers, network gear and printers with owner, location and condition.' },
  { icon: History, t: 'Nothing is overwritten', d: 'Every transfer and repair stays in the history, with who did it and why.' },
  { icon: Wrench, t: 'Maintenance that finds you', d: 'Due and overdue servicing is surfaced on the dashboard automatically.' },
  { icon: ShieldCheck, t: 'Access by role', d: 'Admins, managers, staff and auditors each see and do only what they should.' },
];

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative"><Logo light /></div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-[1.15] tracking-tight">Know where every piece of equipment is, and who has it.</h2>
          <ul className="mt-10 space-y-6">
            {points.map(({ icon: I, t, d }) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15"><I className="h-5 w-5 text-brand-200" /></span>
                <div><p className="text-sm font-semibold">{t}</p><p className="mt-0.5 text-sm text-brand-200/80">{d}</p></div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-brand-200/60">Internal system. Authorised users only.</p>
      </aside>
      <main className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden"><Logo /></div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
