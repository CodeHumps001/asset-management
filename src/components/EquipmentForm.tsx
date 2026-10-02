'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CATEGORY, CONDITION, STATUS, toInputDate } from '@/lib/constants';
import { Alert, Button, Field, btn, toast } from './ui';

const empty = {
  assetNumber: '', category: 'COMPUTER', type: '', name: '', serialNumber: '', manufacturer: '', model: '', purchaseDate: '',
  status: 'IN_USE', condition: 'GOOD', lastMaintenanceDate: '', maintenanceIntervalMonths: '6', notes: '',
  departmentId: '', locationId: '', assignedStaffId: '',
};

export function EquipmentForm({ initial }: { initial?: any }) {
  const router = useRouter();
  const editing = !!initial;
  const [v, setV] = useState<any>(editing ? {
    ...empty, ...Object.fromEntries(Object.keys(empty).map((k) => [k, initial[k] ?? ''])),
    purchaseDate: toInputDate(initial.purchaseDate), lastMaintenanceDate: toInputDate(initial.lastMaintenanceDate),
    maintenanceIntervalMonths: initial.maintenanceIntervalMonths ?? '',
  } : empty);
  const [depts, setDepts] = useState<any[]>([]);
  const [locs, setLocs] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (editing) return;
    Promise.all([api('/departments'), api('/locations'), api('/staff')]).then(([d, l, s]) => { setDepts(d.data); setLocs(l.data); setStaff(s.data); }).catch((e) => setError(e.message));
  }, [editing]);

  const on = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });
  const err = (k: string) => fields[k]?.[0];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(''); setFields({});
    try {
      const body: any = { ...v };
      if (editing) { delete body.departmentId; delete body.locationId; delete body.assignedStaffId; }
      const saved = await api(editing ? `/equipment/${initial.id}` : '/equipment', { method: editing ? 'PATCH' : 'POST', body });
      toast.success(editing ? 'Equipment updated' : 'Equipment added');
      router.push(`/equipment/${saved.id}`);
    } catch (e: any) { setError(e.message); setFields(e.fields ?? {}); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    finally { setBusy(false); }
  }

  const Section = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
    <section className="grid gap-6 border-b border-slate-100 p-6 last:border-0 lg:grid-cols-[240px_1fr]">
      <div><h2 className="font-semibold text-slate-900">{title}</h2>{desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}</div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <div className="card">
        <Section title="Asset information" desc="How this item is identified in the register.">
          <Field label="Asset number" error={err('assetNumber')}><input className="input" required value={v.assetNumber} onChange={on('assetNumber')} placeholder="GWL-PC-024" /></Field>
          <Field label="Category"><select className="input" value={v.category} onChange={on('category')}>{Object.entries(CATEGORY).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
          <Field label="Equipment type" error={err('type')}><input className="input" required value={v.type} onChange={on('type')} placeholder="Desktop Computer" /></Field>
          <Field label="Name or description" error={err('name')}><input className="input" required value={v.name} onChange={on('name')} placeholder="Dell OptiPlex 7090" /></Field>
          <Field label="Serial number" error={err('serialNumber')}><input className="input" value={v.serialNumber} onChange={on('serialNumber')} /></Field>
          <Field label="Purchase date"><input className="input" type="date" value={v.purchaseDate} onChange={on('purchaseDate')} /></Field>
          <Field label="Manufacturer"><input className="input" value={v.manufacturer} onChange={on('manufacturer')} /></Field>
          <Field label="Model"><input className="input" value={v.model} onChange={on('model')} /></Field>
        </Section>
        <Section title="Status and condition" desc="Status is where the item is in its lifecycle. Condition is its physical state.">
          <Field label="Status"><select className="input" value={v.status} onChange={on('status')}>{Object.entries(STATUS).map(([k, l]) => <option key={k} value={k}>{l.label}</option>)}</select></Field>
          <Field label="Condition"><select className="input" value={v.condition} onChange={on('condition')}>{Object.entries(CONDITION).map(([k, l]) => <option key={k} value={k}>{l.label}</option>)}</select></Field>
        </Section>
        <Section title="Maintenance" desc="The next maintenance date is calculated for you.">
          <Field label="Last maintenance"><input className="input" type="date" value={v.lastMaintenanceDate} onChange={on('lastMaintenanceDate')} /></Field>
          <Field label="Interval (months)" hint="Leave empty if not serviced on a schedule." error={err('maintenanceIntervalMonths')}><input className="input" type="number" min={1} max={120} value={v.maintenanceIntervalMonths} onChange={on('maintenanceIntervalMonths')} /></Field>
        </Section>
        <Section title="Assignment" desc={editing ? 'Use Assign or Transfer on the equipment page so the change is recorded in history.' : 'Optional. Equipment can belong to a staff member or just a department and location.'}>
          {editing ? <p className="text-sm text-slate-500 sm:col-span-2">Assignment is managed from the equipment details page.</p> : (<>
            <Field label="Department"><select className="input" value={v.departmentId} onChange={on('departmentId')}><option value="">None</option>{depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
            <Field label="Location"><select className="input" value={v.locationId} onChange={on('locationId')}><option value="">None</option>{locs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
            <Field label="Assigned staff" className="sm:col-span-2" hint="Leave empty for shared equipment such as switches."><select className="input" value={v.assignedStaffId} onChange={on('assignedStaffId')}><option value="">No staff member</option>{staff.filter((s) => !v.departmentId || s.departmentId === v.departmentId).map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} · {s.department.name}</option>)}</select></Field>
          </>)}
        </Section>
        <Section title="Notes"><Field label="Notes" className="sm:col-span-2"><textarea className="input min-h-[96px]" value={v.notes} onChange={on('notes')} /></Field></Section>
      </div>
      <div className="flex justify-end gap-2">
        <Link href={editing ? `/equipment/${initial.id}` : '/equipment'} className={btn('secondary')}>Cancel</Link>
        <Button type="submit" loading={busy}>{editing ? 'Save changes' : 'Add equipment'}</Button>
      </div>
    </form>
  );
}
