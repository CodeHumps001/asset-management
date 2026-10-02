'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { Alert, Button, PageHeader, btn, toast } from '@/components/ui';
import { Guard } from '@/components/AppShell';
import { UserFields, useLookups } from '@/components/UserFields';

export default function NewUserPage() {
  const router = useRouter();
  const { roles, depts } = useLookups();
  const [v, setV] = useState({ firstName: '', lastName: '', email: '', phone: '', departmentId: '', roleId: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const on = (k: string) => (e: React.ChangeEvent<any>) => setV({ ...v, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setFields({});
    try {
      const r = await api('/users', { method: 'POST', body: v });
      r.emailSent ? toast.success(`Invitation sent to ${v.email}`) : toast.error('Member created, but the invitation email could not be delivered. Open the member to resend it.');
      router.push(`/users/${r.user.id}`);
    } catch (e: any) { setError(e.message); setFields(e.fields ?? {}); } finally { setBusy(false); }
  }

  return (
    <Guard perm="USER_CREATE">
      <PageHeader title="Add member" description="They will receive an email with a secure link to activate their account and choose a password." />
      <form onSubmit={submit} className="card max-w-2xl space-y-6 p-6">
        {error && <Alert>{error}</Alert>}
        <UserFields v={v} on={on} fields={fields} roles={roles} depts={depts} />
        <div className="flex items-start gap-3 rounded-lg bg-brand-50 p-3.5 text-sm text-brand-900"><Mail className="mt-0.5 h-4 w-4 shrink-0" /> The invitation link can be used once and expires automatically. No password is ever sent by email.</div>
        <div className="flex justify-end gap-2"><Link href="/users" className={btn('secondary')}>Cancel</Link><Button type="submit" loading={busy}>Add member and send invitation</Button></div>
      </form>
    </Guard>
  );
}
