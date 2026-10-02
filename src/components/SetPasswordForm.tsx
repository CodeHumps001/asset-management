'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Alert, Button, Field } from '@/components/ui';

export function SetPasswordForm({ endpoint, token, cta }: { endpoint: string; token: string; cta: string }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('The two passwords do not match');
    setBusy(true);
    try { await api(endpoint, { method: 'POST', body: { token, password } }); setDone(true); }
    catch (err: any) { setError(err.fields?.password?.[0] || err.message); }
    finally { setBusy(false); }
  }

  if (done) return (
    <div className="space-y-6">
      <Alert tone="success">Your password is set. You can now sign in.</Alert>
      <Link href="/login" className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Go to sign in</Link>
    </div>
  );
  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <Alert>{error}</Alert>}
      <Field label="New password" hint="At least 10 characters, with letters and numbers."><input className="input" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      <Field label="Confirm password"><input className="input" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
      <Button type="submit" loading={busy} className="w-full py-2.5">{cta}</Button>
    </form>
  );
}
