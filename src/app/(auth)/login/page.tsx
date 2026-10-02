'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AuthShell } from '@/components/AuthShell';
import { Alert, Button, Field } from '@/components/ui';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) router.replace('/dashboard'); }, [user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try { await login(email, password); router.replace('/dashboard'); }
    catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <AuthShell title="Sign in" subtitle="Use the email address your administrator registered for you.">
      <form onSubmit={submit} className="space-y-5">
        {error && <Alert>{error}</Alert>}
        <Field label="Email address"><input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></Field>
        <Field label="Password"><input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <div className="flex justify-end"><Link href="/forgot-password" className="text-sm font-medium text-brand-700 hover:text-brand-800">Forgot password?</Link></div>
        <Button type="submit" loading={busy} className="w-full py-2.5">Sign in</Button>
      </form>
    </AuthShell>
  );
}
