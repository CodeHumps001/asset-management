import React from "react";
import {
  Boxes,
  ClipboardCheck,
  History,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export function Logo({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-900/30">
        <Boxes className="h-5 w-5" />
      </span>
      <span
        className={`text-[15px] font-semibold tracking-tight ${light ? "text-white" : "text-slate-900"}`}
      >
        ICT Asset Manager
      </span>
    </div>
  );
}

const points = [
  {
    icon: ClipboardCheck,
    t: "One register for every device",
    d: "Computers, network gear and printers with owner, location and condition.",
  },
  {
    icon: History,
    t: "Nothing is overwritten",
    d: "Every transfer and repair stays in the history, with who did it and why.",
  },
  {
    icon: Wrench,
    t: "Maintenance that finds you",
    d: "Due and overdue servicing is surfaced on the dashboard automatically.",
  },
  {
    icon: ShieldCheck,
    t: "Access by role",
    d: "Admins, managers, staff and auditors each see and do only what they should.",
  },
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-950 via-brand-950 to-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="animate-float absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="animate-float absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl [animation-delay:1.5s]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_22%)]" />
        <div className="relative">
          <Logo light />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-[1.15] tracking-tight">
            Know where every piece of equipment is, and who has it.
          </h2>
          <ul className="mt-10 space-y-4">
            {points.map(({ icon: I, t, d }, index) => (
              <li
                key={t}
                className="group flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 transition-transform duration-200 group-hover:scale-105">
                  <I className="h-5 w-5 text-brand-200" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{t}</p>
                  <p className="mt-0.5 text-sm text-brand-200/80">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-brand-200/60">
          Internal system. Authorised users only.
        </p>
      </aside>
      <main className="flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_26%),linear-gradient(to_bottom,#f8fafc,#f1f5f9)] px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
