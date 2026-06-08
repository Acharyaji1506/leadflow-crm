import { LeadStatus } from '@/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Converted',
  'Lost',
];

export const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  New: {
    label: 'New',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  Contacted: {
    label: 'Contacted',
    color: 'text-violet-700 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/50',
    border: 'border-violet-200 dark:border-violet-800',
    dot: 'bg-violet-500',
  },
  Qualified: {
    label: 'Qualified',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  Converted: {
    label: 'Converted',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  Lost: {
    label: 'Lost',
    color: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    border: 'border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
};

export const TIMELINE_ACTION_LABELS: Record<string, string> = {
  LEAD_CREATED: 'Lead Created',
  LEAD_UPDATED: 'Lead Updated',
  STATUS_CHANGED: 'Status Changed',
  LEAD_DELETED: 'Lead Deleted',
};

export const SCORE_TIER = (score: number): { label: string; color: string } => {
  if (score >= 60) return { label: 'Hot', color: 'text-emerald-600' };
  if (score >= 35) return { label: 'Warm', color: 'text-amber-600' };
  return { label: 'Cold', color: 'text-blue-600' };
};
