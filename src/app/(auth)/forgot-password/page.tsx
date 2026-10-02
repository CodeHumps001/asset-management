'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { AuthShell } from '@/components/AuthShell';
import { Alert, Button, Field } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try { await api('/auth/forgot-password', { method: 'POST', body: { email } }); setDone(true); }
    catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we will send you a link to choose a new password.">
      {done ? (
        <div className="space-y-6">
          <Alert tone="success">If an account exists for {email}, a reset link is on its way. It expires in 60 minutes.</Alert>
          <Link href="/login" className="text-sm font-medium text-brand-700">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          {error && <Alert>{error}</Alert>}
          <Field label="Email address"><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Button type="submit" loading={busy} className="w-full py-2.5">Send reset link</Button>
          <Link href="/login" className="block text-center text-sm font-medium text-slate-600 hover:text-slate-900">Back to sign in</Link>
        </form>
      )}
    </AuthShell>
  );
}
