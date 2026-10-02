'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, MailPlus, Power, PowerOff } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { fmtDateTime, initials } from '@/lib/constants';
import { AccountBadge, Alert, Avatar, Button, Detail, InvitationBadge, RoleBadge, Spinner, toast } from '@/components/ui';
import { Guard } from '@/components/AppShell';
import { UserFields, useLookups } from '@/components/UserFields';

function Content() {
  const { id } = useParams<{ id: string }>();
  const { can, user: me } = useAuth();
  const { roles, depts } = useLookups();
  const [u, setU] = useState<any>(null);
  const [v, setV] = useState<any>(null);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState('');

  const apply = (x: any) => { setU(x); setV({ firstName: x.firstName, lastName: x.lastName, email: x.email, phone: x.phone ?? '', departmentId: x.department?.id ?? '', roleId: x.role.id }); };
  const load = useCallback(() => { api(`/users/${id}`).then(apply).catch((e) => setError(e.message)); }, [id]);
  useEffect(load, [load]);
  const on = (k: string) => (e: React.ChangeEvent<any>) => setV({ ...v, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy('save'); setError(''); setFields({});
    try { const { email, ...body } = v; apply(await api(`/users/${id}`, { method: 'PATCH', body })); toast.success('Member updated'); }
    catch (e: any) { setError(e.message); setFields(e.fields ?? {}); } finally { setBusy(''); }
  }
  async function act(path: string, ok: string) {
    setBusy(path);
    try {
      const r = await api(`/users/${id}/${path}`, { method: 'POST' });
      if (path === 'resend-invitation') { apply(r.user); r.emailSent ? toast.success(ok) : toast.error('The email could not be delivered. You can try sending it again.'); }
      else { apply(r); toast.success(ok); }
    } catch (e: any) { toast.error(e.message); } finally { setBusy(''); }
  }

  if (error && !u) return <Alert>{error}</Alert>;
  if (!u || !v) return <Spinner />;
  const self = u.id === me!.id;

  return (
    <>
      <Link href="/users" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> All members</Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4"><Avatar name={initials(u)} size="lg" />
          <div><h1 className="text-2xl font-semibold tracking-tight">{u.firstName} {u.lastName}</h1><div className="mt-1.5 flex flex-wrap items-center gap-2"><RoleBadge v={u.role.name} /><AccountBadge v={u.accountStatus} /></div></div>
        </div>
        <div className="flex gap-2">
          {can('USER_CREATE') && u.accountStatus === 'PENDING' && <Button variant="secondary" loading={busy === 'resend-invitation'} onClick={() => act('resend-invitation', 'Invitation sent')}><MailPlus className="h-4 w-4" /> Resend invitation</Button>}
          {can('USER_DEACTIVATE') && !self && (u.isActive
            ? <Button variant="secondary" loading={busy === 'deactivate'} onClick={() => act('deactivate', 'Member deactivated')}><PowerOff className="h-4 w-4" /> Deactivate</Button>
            : <Button loading={busy === 'reactivate'} onClick={() => act('reactivate', 'Member reactivated')}><Power className="h-4 w-4" /> Reactivate</Button>)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={save} className="card space-y-5 p-6 lg:col-span-2">
          <h2 className="font-semibold">Profile</h2>
          {error && <Alert>{error}</Alert>}
          <UserFields v={v} on={on} fields={fields} roles={roles} depts={depts} emailLocked canAssignRole={can('ROLE_ASSIGN') && !self} />
          {can('USER_UPDATE') && <div className="flex justify-end"><Button type="submit" loading={busy === 'save'}>Save changes</Button></div>}
        </form>
        <div className="space-y-6">
          <section className="card p-5"><h2 className="mb-4 font-semibold">Account</h2>
            <dl className="space-y-4"><Detail label="Created">{fmtDateTime(u.createdAt)}</Detail><Detail label="Last login">{fmtDateTime(u.lastLoginAt)}</Detail><Detail label="Activated">{u.invitation.acceptedAt ? fmtDateTime(u.invitation.acceptedAt) : 'Not yet'}</Detail></dl></section>
          <section className="card p-5"><h2 className="mb-4 font-semibold">Invitations</h2>
            {u.invitationHistory.length === 0 ? <p className="text-sm text-slate-500">No invitations sent.</p> : (
              <ul className="space-y-3">{u.invitationHistory.map((i: any) => (
                <li key={i.id} className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-500">{fmtDateTime(i.sentAt ?? i.createdAt)}</span><InvitationBadge v={i.status === 'SENT' && new Date(i.expiresAt) < new Date() ? 'EXPIRED' : i.status} /></li>
              ))}</ul>)}
          </section>
        </div>
      </div>
    </>
  );
}
export default function UserDetailPage() { return <Guard perm="USER_VIEW"><Content /></Guard>; }
