'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Alert, PageHeader, Spinner } from '@/components/ui';
import { Guard } from '@/components/AppShell';
import { EquipmentForm } from '@/components/EquipmentForm';

export default function EditEquipmentPage() {
  const { id } = useParams<{ id: string }>();
  const [eq, setEq] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => { api(`/equipment/${id}`).then(setEq).catch((e) => setError(e.message)); }, [id]);
  return (
    <Guard perm="EQUIPMENT_UPDATE">
      {error ? <Alert>{error}</Alert> : !eq ? <Spinner /> : (<><PageHeader title={`Edit ${eq.assetNumber}`} description={eq.name} /><EquipmentForm initial={eq} /></>)}
    </Guard>
  );
}
