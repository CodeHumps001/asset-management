'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pencil, Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useDebounce } from '@/lib/hooks';
import { CATEGORY, CONDITION, STATUS, fmtDate, fullName } from '@/lib/constants';
import { Alert, ConditionBadge, EmptyState, MaintBadge, PageHeader, Pagination, Spinner, StatusBadge, btn } from '@/components/ui';
import { Guard } from '@/components/AppShell';

function Content() {
  const sp = useSearchParams();
  const router = useRouter();
  const { can } = useAuth();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [f, setF] = useState({ status: sp.get('status') ?? '', condition: '', category: sp.get('category') ?? '', due: sp.get('due') ?? '', departmentId: '' });
  const [page, setPage] = useState(1);
  const [depts, setDepts] = useState<any[]>([]);
  const [res, setRes] = useState<any>(null);
  const [error, setError] = useState('');
  const dq = useDebounce(q);

  useEffect(() => { setQ(sp.get('q') ?? ''); }, [sp]);
  useEffect(() => { api('/departments').then((r) => setDepts(r.data)).catch(() => {}); }, []);
  useEffect(() => { setPage(1); }, [dq, f]);
  useEffect(() => {
    setRes(null); setError('');
    api('/equipment', { query: { q: dq, page, pageSize: 10, ...f } }).then(setRes).catch((e) => setError(e.message));
  }, [dq, f, page]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const filtered = !!(dq || Object.values(f).some(Boolean));

  return (
    <>
      <PageHeader title="Equipment" description="Search, filter and manage every ICT asset."
        actions={can('EQUIPMENT_CREATE') && <Link href="/equipment/new" className={btn()}><Plus className="h-4 w-4" /> Add equipment</Link>} />
      <div className="card">
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search equipment…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
          </div>
          <select className="input" value={f.status} onChange={set('status')} aria-label="Status"><option value="">All statuses</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          <select className="input" value={f.condition} onChange={set('condition')} aria-label="Condition"><option value="">All conditions</option>{Object.entries(CONDITION).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          <select className="input" value={f.category} onChange={set('category')} aria-label="Type"><option value="">All types</option>{Object.entries(CATEGORY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select className="input" value={f.due} onChange={set('due')} aria-label="Maintenance">
            <option value="">Any maintenance</option><option value="any">Due or overdue</option><option value="overdue">Overdue</option><option value="today">Due today</option><option value="soon">Due soon</option>
          </select>
        </div>
        {error ? <div className="p-4"><Alert>{error}</Alert></div> : !res ? <Spinner /> : res.data.length === 0 ? (
          <EmptyState title={filtered ? 'No equipment matches your search' : 'No equipment yet'} description={filtered ? 'Try a different search term or clear a filter.' : 'Add your first asset to start building the register.'}
            action={filtered ? <button className={btn('secondary')} onClick={() => { setQ(''); setF({ status: '', condition: '', category: '', due: '', departmentId: '' }); }}>Clear filters</button> : can('EQUIPMENT_CREATE') ? <Link href="/equipment/new" className={btn()}>Add equipment</Link> : undefined} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead className="bg-slate-50/70"><tr><th className="th">Asset</th><th className="th">Type</th><th className="th">Department</th><th className="th">Staff</th><th className="th">Status</th><th className="th">Condition</th><th className="th">Next maintenance</th><th className="th" /></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {res.data.map((e: any) => (
                    <tr key={e.id} className="cursor-pointer hover:bg-slate-50/70" onClick={() => router.push(`/equipment/${e.id}`)}>
                      <td className="td"><Link href={`/equipment/${e.id}`} className="font-semibold text-brand-700 hover:underline" onClick={(ev) => ev.stopPropagation()}>{e.assetNumber}</Link><p className="text-xs text-slate-500">{e.name}</p></td>
                      <td className="td">{e.type}</td>
                      <td className="td">{e.department?.name ?? '—'}</td>
                      <td className="td">{e.assignedStaff ? fullName(e.assignedStaff) : <span className="text-slate-400">—</span>}</td>
                      <td className="td"><StatusBadge v={e.status} /></td>
                      <td className="td"><ConditionBadge v={e.condition} /></td>
                      <td className="td"><p>{fmtDate(e.nextMaintenanceDate)}</p>{['OVERDUE', 'DUE_TODAY', 'DUE_SOON'].includes(e.maintenance.state) && <div className="mt-1"><MaintBadge m={e.maintenance} /></div>}</td>
                      <td className="td text-right">{can('EQUIPMENT_UPDATE') && <Link href={`/equipment/${e.id}/edit`} onClick={(ev) => ev.stopPropagation()} className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Edit ${e.assetNumber}`}><Pencil className="h-4 w-4" /></Link>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={res.meta} onChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}
export default function EquipmentPage() { return <Guard perm="EQUIPMENT_VIEW"><Suspense><Content /></Suspense></Guard>; }
