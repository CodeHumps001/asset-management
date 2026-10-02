'use client';
import { PageHeader } from '@/components/ui';
import { Guard } from '@/components/AppShell';
import { EquipmentForm } from '@/components/EquipmentForm';

export default function NewEquipmentPage() {
  return <Guard perm="EQUIPMENT_CREATE"><PageHeader title="Add equipment" description="Register a new asset." /><EquipmentForm /></Guard>;
}
