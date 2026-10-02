"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Laptop,
  Network,
  PackageOpen,
  Printer,
  ShieldCheck,
  TriangleAlert,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CONDITION, STATUS } from "@/lib/constants";
import {
  Alert,
  EmptyState,
  MaintBadge,
  PageHeader,
  Spinner,
  cn,
  toneDot,
} from "@/components/ui";
import { Guard } from "@/components/AppShell";

const CARDS = [
  {
    k: "total",
    label: "Total assets",
    icon: Boxes,
    c: "bg-brand-50 text-brand-700",
    href: "/equipment",
  },
  {
    k: "computers",
    label: "Computers",
    icon: Laptop,
    c: "bg-sky-50 text-sky-700",
    href: "/equipment?category=COMPUTER",
  },
  {
    k: "network",
    label: "Network devices",
    icon: Network,
    c: "bg-indigo-50 text-indigo-700",
    href: "/equipment?category=NETWORK",
  },
  {
    k: "printers",
    label: "Printers",
    icon: Printer,
    c: "bg-violet-50 text-violet-700",
    href: "/equipment?category=PRINTER",
  },
  {
    k: "underMaintenance",
    label: "Under maintenance",
    icon: Wrench,
    c: "bg-amber-50 text-amber-700",
    href: "/equipment?status=UNDER_MAINTENANCE",
  },
  {
    k: "faulty",
    label: "Faulty",
    icon: TriangleAlert,
    c: "bg-red-50 text-red-700",
    href: "/equipment?status=FAULTY",
  },
  {
    k: "inStorage",
    label: "In storage",
    icon: PackageOpen,
    c: "bg-blue-50 text-blue-700",
    href: "/equipment?status=IN_STORAGE",
  },
  {
    k: "maintenanceDue",
    label: "Maintenance due",
    icon: AlertTriangle,
    c: "bg-orange-50 text-orange-700",
    href: "/equipment?due=any",
  },
  {
    k: "systemUsers",
    label: "System users",
    icon: Users,
    c: "bg-slate-100 text-slate-700",
    href: "/users",
    perm: "USER_VIEW",
  },
  {
    k: "activeMembers",
    label: "Active members",
    icon: UserCheck,
    c: "bg-emerald-50 text-emerald-700",
    href: "/users?status=ACTIVE",
    perm: "USER_VIEW",
  },
];

function Bars({
  rows,
  map,
}: {
  rows: { key: string; count: number }[];
  map: Record<string, { label: string; tone: any }>;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <ul className="space-y-3.5">
      {Object.keys(map).map((k) => {
        const n = rows.find((r) => r.key === k)?.count ?? 0;
        return (
          <li key={k}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-slate-600">{map[k].label}</span>
              <span className="font-semibold text-slate-900">{n}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-full rounded-full",
                  toneDot[map[k].tone as keyof typeof toneDot],
                )}
                style={{ width: `${(n / max) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Content() {
  const { user, can } = useAuth();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/dashboard/stats")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  if (error) return <Alert>{error}</Alert>;
  if (!data) return <Spinner />;
  const t = data.totals;
  const cards = CARDS.filter((c) => !c.perm || can(c.perm));

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user!.firstName}`}
        description="Here is where your ICT equipment stands today."
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ k, label, icon: I, c, href }) => (
          <Link
            key={k}
            href={href}
            className="card group p-4 transition-shadow hover:shadow-md"
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                c,
              )}
            >
              <I className="h-[18px] w-[18px]" />
            </span>
            <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
              {t[k]}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Maintenance due</h2>
              <p className="text-xs text-slate-500">
                Overdue, due today, or due within {data.reminderDays} days
              </p>
            </div>
            <Link
              href="/equipment?due=any"
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              View all
            </Link>
          </div>
          {data.maintenanceDueList.length === 0 ? (
            <EmptyState
              title="Nothing is due"
              description="All equipment is on schedule."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.maintenanceDueList.map((e: any) => (
                <li key={e.id}>
                  <Link
                    href={`/equipment/${e.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {e.assetNumber}{" "}
                        <span className="font-normal text-slate-500">
                          · {e.type}
                        </span>
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {e.department?.name ?? e.location?.name ?? "Unassigned"}
                      </p>
                    </div>
                    <MaintBadge m={e.maintenance} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-900">Status</h2>
            <Bars rows={data.byStatus} map={STATUS} />
          </section>
          <section className="card p-5">
            <h2 className="mb-4 font-semibold text-slate-900">Condition</h2>
            <Bars rows={data.byCondition} map={CONDITION} />
          </section>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Guard perm="DASHBOARD_VIEW">
      <Content />
    </Guard>
  );
}
