'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowRightLeft, Archive, Pencil, Plus, Wrench } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { CATEGORY, CONDITION, STATUS, fmtDate, fmtDateTime, fullName } from '@/lib/constants';
import { Alert, Button, ConditionBadge, Detail, EmptyState, Field, MaintBadge, Modal, Spinner, StatusBadge, btn, cn, toast } from '@/components/ui';
import { Guard } from '@/components/AppShell';

/* ---------- assign / transfer ---------- */
function AssignModal({ eq, mode, onClose, onDone }: { eq: any; mode: 'assign' | 'transfer'; onClose: () => void; onDone: () => void }) {
  const [depts, setDepts] = useState<any[]>([]); const [locs, setLocs] = useState<any[]>([]); const [staff, setStaff] = useState<any[]>([]);
  const [v, setV] = useState({ staffId: '', departmentId: eq.departmentId ?? '', locationId: eq.locationId ?? '', reason: '' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => { Promise.all([api('/departments'), api('/locations'), api('/staff')]).then(([d, l, s]) => { setDepts(d.data); setLocs(l.data); setStaff(s.data); }); }, []);
  const on = (k: string) => (e: React.ChangeEvent<any>) => setV({ ...v, [k]: e.target.value });
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try { await api(`/equipment/${eq.id}/${mode}`, { method: 'POST', body: v }); toast.success(mode === 'assign' ? 'Equipment assigned' : 'Equipment transferred'); onDone(); }
    catch (err: any) { setError(err.message); } finally { setBusy(false); }
  }
  return (
    <Modal open onClose={onClose} title={mode === 'assign' ? `Assign ${eq.assetNumber}` : `Transfer ${eq.assetNumber}`}>
      <form onSubmit={save} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <p className="text-sm text-slate-500">{mode === 'transfer' ? 'The current assignment is kept in history and replaced with the details below.' : 'Choose who or where this equipment belongs.'}</p>
        <Field label="Staff member" hint="Leave empty to assign to a department or location only."><select className="input" value={v.staffId} onChange={on('staffId')}><option value="">None</option>{staff.filter((s) => !v.departmentId || s.departmentId === v.departmentId).map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}</select></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Department"><select className="input" value={v.departmentId} onChange={on('departmentId')}><option value="">None</option>{depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
          <Field label="Location"><select className="input" value={v.locationId} onChange={on('locationId')}><option value="">None</option>{locs.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
        </div>
        <Field label="Reason or notes"><textarea className="input" rows={2} value={v.reason} onChange={on('reason')} placeholder="e.g. Staff A left the department" /></Field>
        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={busy}>{mode === 'assign' ? 'Assign equipment' : 'Transfer equipment'}</Button></div>
      </form>
    </Modal>
  );
}

/* ---------- maintenance ---------- */
function MaintenanceModal({ eq, onClose, onDone }: { eq: any; onClose: () => void; onDone: () => void }) {
  const [v, setV] = useState({ maintenanceDate: new Date().toISOString().slice(0, 10), maintenanceType: '', description: '', technician: '', cost: '', notes: '', setStatus: '', setCondition: '' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [fields, setFields] = useState<Record<string, string[]>>({});
  const on = (k: string) => (e: React.ChangeEvent<any>) => setV({ ...v, [k]: e.target.value });
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setFields({});
    try { await api(`/equipment/${eq.id}/maintenance`, { method: 'POST', body: v }); toast.success('Maintenance recorded'); onDone(); }
    catch (err: any) { setError(err.message); setFields(err.fields ?? {}); } finally { setBusy(false); }
  }
  return (
    <Modal open onClose={onClose} title={`Record maintenance for ${eq.assetNumber}`} wide>
      <form onSubmit={save} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date"><input className="input" type="date" required value={v.maintenanceDate} onChange={on('maintenanceDate')} /></Field>
          <Field label="Type" error={fields.maintenanceType?.[0]}><input className="input" required value={v.maintenanceType} onChange={on('maintenanceType')} placeholder="Battery replacement" /></Field>
          <Field label="Technician" error={fields.technician?.[0]}><input className="input" required value={v.technician} onChange={on('technician')} /></Field>
          <Field label="Cost (optional)"><input className="input" type="number" min={0} step="0.01" value={v.cost} onChange={on('cost')} /></Field>
        </div>
        <Field label="Description" error={fields.description?.[0]}><textarea className="input" rows={2} required value={v.description} onChange={on('description')} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Update status afterwards"><select className="input" value={v.setStatus} onChange={on('setStatus')}><option value="">Keep as is</option>{Object.entries(STATUS).map(([k, l]) => <option key={k} value={k}>{l.label}</option>)}</select></Field>
          <Field label="Update condition afterwards"><select className="input" value={v.setCondition} onChange={on('setCondition')}><option value="">Keep as is</option>{Object.entries(CONDITION).map(([k, l]) => <option key={k} value={k}>{l.label}</option>)}</select></Field>
        </div>
        <Field label="Notes"><textarea className="input" rows={2} value={v.notes} onChange={on('notes')} /></Field>
        <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={busy}>Save record</Button></div>
      </form>
    </Modal>
  );
}

/* ---------- page ---------- */
function Content() {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  const [eq, setEq] = useState<any>(null);
  const [history, setHistory] = useState<any[] | null>(null);
  const [maint, setMaint] = useState<any[] | null>(null);
  const [tab, setTab] = useState<'assign' | 'maint'>('assign');
  const [modal, setModal] = useState<'assign' | 'transfer' | 'maint' | 'retire' | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api(`/equipment/${id}`).then(setEq).catch((e) => setError(e.message));
    if (can('HISTORY_VIEW')) api(`/equipment/${id}/history`).then((r) => setHistory(r.data)).catch(() => setHistory([]));
    if (can('MAINTENANCE_VIEW')) api(`/equipment/${id}/maintenance`).then((r) => setMaint(r.data)).catch(() => setMaint([]));
  }, [id, can]);
  useEffect(load, [load]);
  const done = () => { setModal(null); load(); };

  if (error) return <Alert>{error}</Alert>;
  if (!eq) return <Spinner />;
  const assigned = !!(eq.assignedStaffId || eq.departmentId || eq.locationId);
  const retired = eq.status === 'RETIRED';

  async function retire() {
    try { await api(`/equipment/${id}`, { method: 'DELETE' }); toast.success('Equipment retired'); done(); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <>
      <Link href="/equipment" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> All equipment</Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-semibold tracking-tight">{eq.assetNumber}</h1><StatusBadge v={eq.status} /><ConditionBadge v={eq.condition} /></div>
          <p className="mt-1 text-sm text-slate-500">{eq.type} · {eq.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!retired && can('MAINTENANCE_CREATE') && <Button variant="secondary" onClick={() => setModal('maint')}><Wrench className="h-4 w-4" /> Record maintenance</Button>}
          {!retired && (assigned ? can('EQUIPMENT_TRANSFER') : can('EQUIPMENT_ASSIGN')) && <Button variant="secondary" onClick={() => setModal(assigned ? 'transfer' : 'assign')}><ArrowRightLeft className="h-4 w-4" /> {assigned ? 'Transfer' : 'Assign'}</Button>}
          {can('EQUIPMENT_UPDATE') && <Link href={`/equipment/${id}/edit`} className={btn()}><Pencil className="h-4 w-4" /> Edit</Link>}
          {!retired && can('EQUIPMENT_DELETE') && <Button variant="ghost" onClick={() => setModal('retire')}><Archive className="h-4 w-4" /> Retire</Button>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5"><h2 className="mb-4 font-semibold">Asset information</h2>
          <dl className="grid grid-cols-2 gap-4"><Detail label="Category">{CATEGORY[eq.category]}</Detail><Detail label="Serial number">{eq.serialNumber}</Detail><Detail label="Manufacturer">{eq.manufacturer}</Detail><Detail label="Model">{eq.model}</Detail><Detail label="Purchase date">{fmtDate(eq.purchaseDate)}</Detail></dl></section>
        <section className="card p-5"><h2 className="mb-4 font-semibold">Current assignment</h2>
          {assigned ? <dl className="grid grid-cols-2 gap-4"><Detail label="Staff">{eq.assignedStaff ? fullName(eq.assignedStaff) : 'None (shared)'}</Detail><Detail label="Department">{eq.department?.name}</Detail><Detail label="Location">{eq.location?.name}</Detail></dl>
            : <p className="text-sm text-slate-500">Not assigned. This item is not currently with anyone.</p>}</section>
        <section className="card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Maintenance</h2><MaintBadge m={eq.maintenance} /></div>
          <dl className="grid grid-cols-2 gap-4"><Detail label="Last">{fmtDate(eq.lastMaintenanceDate)}</Detail><Detail label="Next">{fmtDate(eq.nextMaintenanceDate)}</Detail><Detail label="Interval">{eq.maintenanceIntervalMonths ? `${eq.maintenanceIntervalMonths} months` : ''}</Detail></dl></section>
      </div>
      {eq.notes && <p className="card mt-6 p-5 text-sm text-slate-600"><span className="font-semibold text-slate-900">Notes: </span>{eq.notes}</p>}

      <section className="card mt-6">
        <div className="flex gap-1 border-b border-slate-100 px-3">
          {([['assign', 'Assignments and transfers', history], ['maint', 'Maintenance history', maint]] as const).map(([k, label, rows]) => (
            <button key={k} onClick={() => setTab(k)} className={cn('relative px-3 py-3.5 text-sm font-medium', tab === k ? 'text-brand-700 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-600' : 'text-slate-500 hover:text-slate-800')}>
              {label}{rows && <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{rows.length}</span>}
            </button>
          ))}
        </div>
        {tab === 'assign' && (!can('HISTORY_VIEW') ? <EmptyState title="History is not available for your role" /> : !history ? <Spinner /> : history.length === 0 ? <EmptyState title="No assignments recorded" description="History appears here once the equipment is assigned." /> : (
          <ol className="divide-y divide-slate-100">
            {history.map((h) => {
              const who = (s: any, d: any, l: any) => [s ? fullName(s) : null, d?.name, l?.name].filter(Boolean).join(' · ') || 'Unassigned';
              return (
                <li key={h.id} className="flex gap-4 px-5 py-4">
                  <span className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', h.isCurrent ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300')} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {(h.previousStaff || h.previousDepartment || h.previousLocation) && <><span className="text-slate-500">{who(h.previousStaff, h.previousDepartment, h.previousLocation)}</span><ArrowRight className="h-3.5 w-3.5 text-slate-400" /></>}
                      <span className="font-semibold text-slate-900">{who(h.staff, h.department, h.location)}</span>
                      {h.isCurrent && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Current</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{fmtDate(h.transferDate)}{h.transferredBy && ` · by ${fullName(h.transferredBy)}`}{h.reason && ` · ${h.reason}`}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        ))}
        {tab === 'maint' && (!can('MAINTENANCE_VIEW') ? <EmptyState title="Maintenance history is not available for your role" /> : !maint ? <Spinner /> : maint.length === 0 ? <EmptyState title="No maintenance recorded" description="Records you add are kept permanently." action={!retired && can('MAINTENANCE_CREATE') ? <Button onClick={() => setModal('maint')}><Plus className="h-4 w-4" /> Record maintenance</Button> : undefined} /> : (
          <ol className="divide-y divide-slate-100">
            {maint.map((m) => (
              <li key={m.id} className="px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-sm font-semibold text-slate-900">{m.maintenanceType}</p><p className="text-xs text-slate-500">{fmtDate(m.maintenanceDate)}</p></div>
                <p className="mt-1 text-sm text-slate-600">{m.description}</p>
                <p className="mt-1 text-xs text-slate-500">Technician: {m.technician}{m.cost != null && ` · Cost: ${m.cost}`}{m.recordedBy && ` · Recorded by ${fullName(m.recordedBy)}`}</p>
                {m.notes && <p className="mt-1 text-xs text-slate-500">{m.notes}</p>}
              </li>
            ))}
          </ol>
        ))}
      </section>

      {(modal === 'assign' || modal === 'transfer') && <AssignModal eq={eq} mode={modal} onClose={() => setModal(null)} onDone={done} />}
      {modal === 'maint' && <MaintenanceModal eq={eq} onClose={() => setModal(null)} onDone={done} />}
      <Modal open={modal === 'retire'} onClose={() => setModal(null)} title="Retire this equipment?">
        <p className="text-sm text-slate-600">{eq.assetNumber} will be marked as retired. Its assignment and maintenance history is kept.</p>
        <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button variant="danger" onClick={retire}>Retire equipment</Button></div>
      </Modal>
    </>
  );
}
export default function EquipmentDetailPage() { return <Guard perm="EQUIPMENT_VIEW"><Content /></Guard>; }
