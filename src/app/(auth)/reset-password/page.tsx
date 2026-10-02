'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';
import { Alert } from '@/components/ui';
import { SetPasswordForm } from '@/components/SetPasswordForm';

function Inner() {
  const token = useSearchParams().get('token');
  return (
    <AuthShell title="Choose a new password">
      {token ? <SetPasswordForm endpoint="/auth/reset-password" token={token} cta="Update password" /> : <Alert>This reset link is missing its token. Request a new one.</Alert>}
    </AuthShell>
  );
}
export default function ResetPasswordPage() { return <Suspense><Inner /></Suspense>; }
