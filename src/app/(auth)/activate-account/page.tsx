'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { AuthShell } from '@/components/AuthShell';
import { Alert, RoleBadge, Spinner } from '@/components/ui';
import { SetPasswordForm } from '@/components/SetPasswordForm';

function Inner() {
  const token = useSearchParams().get('token');
  const [info, setInfo] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setError('This activation link is missing its token.'); return; }
    api('/auth/invitation', { query: { token } }).then(setInfo).catch((e) => setError(e.message));
  }, [token]);

  return (
    <AuthShell title="Activate your account" subtitle={info ? `Welcome, ${info.name}. Create a password to finish setting up.` : undefined}>
      {error ? (
        <div className="space-y-4"><Alert>{error}</Alert><Link href="/login" className="text-sm font-medium text-brand-700">Go to sign in</Link></div>
      ) : !info ? <Spinner /> : (
        <div className="space-y-6">
          <div className="rounded-xl bg-slate-50 p-4 text-sm ring-1 ring-slate-200">
            <p className="text-slate-500">Signing in as</p>
            <p className="font-medium text-slate-900">{info.email}</p>
            <div className="mt-2 flex items-center gap-2"><RoleBadge v={info.role} />{info.department && <span className="text-xs text-slate-500">{info.department}</span>}</div>
          </div>
          <SetPasswordForm endpoint="/auth/activate" token={token!} cta="Activate account" />
        </div>
      )}
    </AuthShell>
  );
}
export default function ActivatePage() { return <Suspense><Inner /></Suspense>; }
