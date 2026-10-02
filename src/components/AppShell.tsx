"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ScrollText,
  Search,
  Users,
  X,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Logo } from "./AuthShell";
import { Avatar, RoleBadge, Spinner, cn } from "./ui";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    perm: "DASHBOARD_VIEW",
  },
  {
    href: "/equipment",
    label: "Equipment",
    icon: Package,
    perm: "EQUIPMENT_VIEW",
  },
  { href: "/users", label: "Members", icon: Users, perm: "USER_VIEW" },
  {
    href: "/audit-logs",
    label: "Audit logs",
    icon: ScrollText,
    perm: "AUDIT_LOG_VIEW",
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, can } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);
  useEffect(() => setOpen(false), [path]);
  if (loading || !user) return <Spinner />;

  const items = NAV.filter((n) => can(n.perm));
  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-brand-950 via-brand-950 to-slate-950 text-brand-100 shadow-2xl shadow-slate-900/15">
      <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute -right-10 bottom-14 h-36 w-36 rounded-full bg-indigo-400/15 blur-3xl" />
      <div className="relative flex h-16 items-center justify-between px-5">
        <Logo light />
        <button
          className="rounded-lg p-1.5 text-brand-100/80 transition hover:bg-white/5 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="relative mt-4 flex-1 space-y-1.5 px-3">
        {items.map(({ href, label, icon: I }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-0.5",
                active
                  ? "bg-white/10 text-white shadow-lg shadow-brand-950/20 ring-1 ring-white/10"
                  : "text-brand-200/80 hover:bg-white/5 hover:text-white",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  active
                    ? "bg-brand-500/20 text-brand-200"
                    : "bg-white/5 text-brand-200/70 group-hover:bg-white/10",
                )}
              >
                <I
                  className={cn(
                    "h-[18px] w-[18px]",
                    active && "text-brand-200",
                  )}
                />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="relative border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5">
          <Avatar name={`${user.firstName[0]}${user.lastName[0]}`} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-brand-300/80">{user.email}</p>
          </div>
        </div>
        <button
          onClick={async () => {
            await logout();
            router.replace("/login");
          }}
          className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-brand-200/80 transition-all hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        {sidebar}
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 animate-fade-up">
            {sidebar}
          </div>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/75 px-4 shadow-sm shadow-slate-200/40 backdrop-blur-xl sm:px-8">
          <button
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          {can("EQUIPMENT_VIEW") && (
            <form
              className="relative w-full max-w-md"
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/equipment?q=${encodeURIComponent(q)}`);
              }}
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search asset number, serial, staff, location…"
                className="input bg-slate-100/90 pl-9 focus:bg-white"
                aria-label="Search equipment"
              />
            </form>
          )}
          <div className="ml-auto hidden sm:block">
            <RoleBadge v={user.role} />
          </div>
        </header>
        <main className="mx-auto max-w-7xl animate-fade-up px-4 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function Guard({
  perm,
  children,
}: {
  perm: string;
  children: React.ReactNode;
}) {
  const { can } = useAuth();
  if (can(perm)) return <>{children}</>;
  return (
    <div className="card mx-auto mt-10 flex max-w-md flex-col items-center p-10 text-center">
      <ShieldAlert className="h-10 w-10 text-amber-500" />
      <p className="mt-3 font-semibold text-slate-900">
        You do not have access to this page
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Ask an administrator if you need a different role.
      </p>
    </div>
  );
}
