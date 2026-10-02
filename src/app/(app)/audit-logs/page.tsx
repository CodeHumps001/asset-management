'use client';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';
import { fmtDateTime, fullName } from '@/lib/constants';
import { Alert, Badge, EmptyState, PageHeader, Pagination, Spinner } from '@/components/ui';
import { Guard } from '@/components/AppShell';

const tone = (a: string) => (a.includes('FAILED') || a.includes('DEACTIVATED') || a.includes('RETIRED') ? 'red' : a.startsWith('LOGIN') || a === 'LOGOUT' ? 'slate' : a.includes('CREATED') || a.includes('ACCEPTED') || a.includes('REACTIVATED') ? 'green' : a.includes('INVITATION') ? 'indigo' : 'blue') as any;

function Content() {
  const [q, setQ] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [actions, setActions] = useState<string[]>([]);
  const [res, setRes] = useState<any>(null);
  const [error, setError] = useState('');
  const dq = useDebounce(q);
  useEffect(() => { api('/audit-logs/actions').then((r) => setActions(r.data)).catch(() => {}); }, []);
  useEffect(() => { setPage(1); }, [dq, action]);
  useEffect(() => { api('/audit-logs', { query: { q: dq, action, page, pageSize: 20 } }).then(setRes).catch((e) => setError(e.message)); }, [dq, action, page]);

  return (
    <>
      <PageHeader title="Audit logs" description="A permanent record of important actions. Entries cannot be edited or deleted." />
      <div className="card">
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-3">
          <div className="relative sm:col-span-2"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="input pl-9" placeholder="Search descriptions…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search logs" /></div>
          <select className="input" value={action} onChange={(e) => setAction(e.target.value)} aria-label="Action"><option value="">All actions</option>{actions.map((a) => <option key={a} value={a}>{a.replace(/_/g, ' ').toLowerCase()}</option>)}</select>
        </div>
        {error ? <div className="p-4"><Alert>{error}</Alert></div> : !res ? <Spinner /> : res.data.length === 0 ? <EmptyState title="No log entries match" /> : (
          <>
            <div className="overflow-x-auto"><table className="w-full min-w-[820px]">
              <thead className="bg-slate-50/70"><tr><th className="th">When</th><th className="th">Actor</th><th className="th">Action</th><th className="th">Description</th><th className="th">IP address</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{res.data.map((l: any) => (
                <tr key={l.id}>
                  <td className="td whitespace-nowrap text-slate-500">{fmtDateTime(l.createdAt)}</td>
                  <td className="td whitespace-nowrap">{l.actor ? fullName(l.actor) : <span className="text-slate-400">System</span>}</td>
                  <td className="td"><Badge tone={tone(l.action)}>{l.action.replace(/_/g, ' ').toLowerCase()}</Badge></td>
                  <td className="td">{l.description}</td>
                  <td className="td text-slate-500">{l.ipAddress ?? '—'}</td>
                </tr>))}</tbody>
            </table></div>
            <Pagination meta={res.meta} onChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}
export default function AuditLogsPage() { return <Guard perm="AUDIT_LOG_VIEW"><Content /></Guard>; }
