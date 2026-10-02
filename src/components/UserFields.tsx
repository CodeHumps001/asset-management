'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Field } from './ui';

export function useLookups() {
  const [roles, setRoles] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  useEffect(() => { Promise.all([api('/roles'), api('/departments')]).then(([r, d]) => { setRoles(r.data); setDepts(d.data); }).catch(() => {}); }, []);
  return { roles, depts };
}

export function UserFields({ v, on, fields, roles, depts, emailLocked, canAssignRole = true }: { v: any; on: (k: string) => (e: React.ChangeEvent<any>) => void; fields: Record<string, string[]>; roles: any[]; depts: any[]; emailLocked?: boolean; canAssignRole?: boolean }) {
  const err = (k: string) => fields[k]?.[0];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="First name" error={err('firstName')}><input className="input" required value={v.firstName} onChange={on('firstName')} /></Field>
      <Field label="Last name" error={err('lastName')}><input className="input" required value={v.lastName} onChange={on('lastName')} /></Field>
      <Field label="Email address" error={err('email')} className="sm:col-span-2"><input className="input" type="email" required disabled={emailLocked} value={v.email} onChange={on('email')} /></Field>
      <Field label="Phone number (optional)"><input className="input" value={v.phone} onChange={on('phone')} /></Field>
      <Field label="Department"><select className="input" value={v.departmentId} onChange={on('departmentId')}><option value="">Not assigned</option>{depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
      <Field label="Role" error={err('roleId')} className="sm:col-span-2" hint={v.roleId ? roles.find((r) => r.id === v.roleId)?.description : undefined}>
        <select className="input" required disabled={!canAssignRole} value={v.roleId} onChange={on('roleId')}><option value="">Select a role</option>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
      </Field>
    </div>
  );
}
