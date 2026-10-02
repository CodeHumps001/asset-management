export type Tone = 'green' | 'amber' | 'blue' | 'red' | 'slate' | 'dark' | 'violet' | 'indigo';

export const STATUS: Record<string, { label: string; tone: Tone }> = {
  IN_USE: { label: 'In use', tone: 'green' },
  UNDER_MAINTENANCE: { label: 'Under maintenance', tone: 'amber' },
  IN_STORAGE: { label: 'In storage', tone: 'blue' },
  FAULTY: { label: 'Faulty', tone: 'red' },
  RETIRED: { label: 'Retired', tone: 'dark' },
};
export const CONDITION: Record<string, { label: string; tone: Tone }> = {
  EXCELLENT: { label: 'Excellent', tone: 'green' },
  GOOD: { label: 'Good', tone: 'blue' },
  FAIR: { label: 'Fair', tone: 'amber' },
  POOR: { label: 'Poor', tone: 'red' },
  DAMAGED: { label: 'Damaged', tone: 'dark' },
};
export const CATEGORY: Record<string, string> = { COMPUTER: 'Computer', NETWORK: 'Network device', PRINTER: 'Printer', OTHER: 'Other' };
export const INVITATION: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: 'Pending', tone: 'slate' },
  SENT: { label: 'Sent', tone: 'blue' },
  DELIVERED: { label: 'Delivered', tone: 'indigo' },
  ACCEPTED: { label: 'Accepted', tone: 'green' },
  EXPIRED: { label: 'Expired', tone: 'amber' },
  FAILED: { label: 'Failed', tone: 'red' },
};
export const ACCOUNT: Record<string, { label: string; tone: Tone }> = {
  ACTIVE: { label: 'Active', tone: 'green' },
  PENDING: { label: 'Awaiting activation', tone: 'amber' },
  INACTIVE: { label: 'Deactivated', tone: 'slate' },
};
export const ROLE_TONE: Record<string, Tone> = { Admin: 'violet', 'ICT Manager': 'indigo', 'ICT Staff': 'blue', Viewer: 'slate' };
export const MAINT: Record<string, { label: string; tone: Tone }> = {
  OVERDUE: { label: 'Overdue', tone: 'red' },
  DUE_TODAY: { label: 'Due today', tone: 'amber' },
  DUE_SOON: { label: 'Due soon', tone: 'amber' },
  OK: { label: 'On schedule', tone: 'green' },
  NONE: { label: 'Not scheduled', tone: 'slate' },
};

export const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—');
export const fmtDateTime = (s?: string | null) => (s ? new Date(s).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never');
export const toInputDate = (s?: string | null) => (s ? s.slice(0, 10) : '');
export const fullName = (p?: { firstName: string; lastName: string } | null) => (p ? `${p.firstName} ${p.lastName}` : '—');
export const initials = (p: { firstName: string; lastName: string }) => `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase();
