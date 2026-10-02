'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MailPlus, Plus, Power, PowerOff, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useDebounce } from '@/lib/hooks';
import { fmtDateTime, initials } from '@/lib/constants';
import { AccountBadge, Alert, Avatar, Button, EmptyState, InvitationBadge, PageHeader, Pagination, RoleBadge, Spinner, btn, toast } from '@/components/ui';
import { Guard } from '@/components/AppShell';

function Content() {
  const sp = useSearchParams();
  const { can, user: me } = useAuth();
  const [q, setQ] = useState('');
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState(sp.get('status') ?? '');
  const [page, setPage] = useState(1);
  const [roles, setRoles] = useState<any[]>([]);
  const [res, setRes] = useState<any>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const dq = useDebounce(q);

  useEffect(() => { api('/roles').then((r) => setRoles(r.data)).catch(() => {}); }, []);
  useEffect(() => { setPage(1); }, [dq, roleId, status]);
  const load = useCallback(() => {
    api('/users', { query: { q: dq, roleId, status, page, pageSize: 10 } }).then(setRes).catch((e) => setError(e.message));
  }, [dq, roleId, status, page]);
  useEffect(load, [load]);

  async function act(id: string, path: string, ok: string) {
    setBusyId(id);
    try {
      const r = await api(`/users/${id}/${path}`, { method: 'POST' });
      if (path === 'resend-invitation') r.emailSent ? toast.success(ok) : toast.error('The email could not be delivered. You can try sending it again.');
      else toast.success(ok);
      load();
    } catch (e: any) { toast.error(e.message); } finally { setBusyId(''); }
  }

  return (
    <>
      <PageHeader title="Members" description="People who can sign in to the system, their roles and invitation status."
        actions={can('USER_CREATE') && <Link href="/users/new" className={btn()}><Plus className="h-4 w-4" /> Add member</Link>} />
      <div className="card">
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-3">
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="input pl-9" placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search members" /></div>
          <select className="input" value={roleId} onChange={(e) => setRoleId(e.target.value)} aria-label="Role"><option value="">All roles</option>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Account status"><option value="">All accounts</option><option value="ACTIVE">Active</option><option value="PENDING">Awaiting activation</option><option value="INACTIVE">Deactivated</option></select>
        </div>
        {error ? <div className="p-4"><Alert>{error}</Alert></div> : !res ? <Spinner /> : res.data.length === 0 ? <EmptyState title="No members found" description="Try a different search or filter." /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50/70"><tr><th className="th">Member</th><th className="th">Role</th><th className="th">Department</th><th className="th">Account</th><th className="th">Invitation</th><th className="th">Last login</th><th className="th" /></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {res.data.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="td"><Link href={`/users/${u.id}`} className="flex items-center gap-3"><Avatar name={initials(u)} /><span><span className="block font-semibold text-slate-900 hover:text-brand-700">{u.firstName} {u.lastName}</span><span className="block text-xs text-slate-500">{u.email}</span></span></Link></td>
                      <td className="td"><RoleBadge v={u.role.name} /></td>
                      <td className="td">{u.department?.name ?? '—'}</td>
                      <td className="td"><AccountBadge v={u.accountStatus} /></td>
                      <td className="td"><InvitationBadge v={u.invitation.status} /></td>
                      <td className="td text-slate-500">{fmtDateTime(u.lastLoginAt)}</td>
                      <td className="td"><div className="flex justify-end gap-1.5">
                        {can('USER_CREATE') && u.accountStatus === 'PENDING' && <Button size="sm" variant="secondary" loading={busyId === u.id} onClick={() => act(u.id, 'resend-invitation', 'Invitation sent')}><MailPlus className="h-3.5 w-3.5" /> Resend</Button>}
                        {can('USER_DEACTIVATE') && u.id !== me!.id && (u.isActive
                          ? <Button size="sm" variant="ghost" loading={busyId === u.id} onClick={() => act(u.id, 'deactivate', 'Member deactivated')}><PowerOff className="h-3.5 w-3.5" /> Deactivate</Button>
                          : <Button size="sm" variant="ghost" loading={busyId === u.id} onClick={() => act(u.id, 'reactivate', 'Member reactivated')}><Power className="h-3.5 w-3.5" /> Reactivate</Button>)}
                      </div></td>
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
export default function UsersPage() { return <Guard perm="USER_VIEW"><Suspense><Content /></Suspense></Guard>; }
