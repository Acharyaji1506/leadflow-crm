import { LeadStatus } from '../models/Lead';

interface ScoringInput {
  email: string;
  status: LeadStatus;
  notes: string;
  company: string;
}

export interface ScoreBreakdown {
  total: number;
  details: Array<{ reason: string; points: number }>;
}

export const calculateLeadScore = (input: ScoringInput): ScoreBreakdown => {
  const details: Array<{ reason: string; points: number }> = [];
  let total = 0;

  // Email scoring
  const emailDomain = input.email.split('@')[1]?.toLowerCase() || '';
  const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com'];

  if (personalDomains.includes(emailDomain)) {
    details.push({ reason: 'Personal email (Gmail/Yahoo/etc)', points: 5 });
    total += 5;
  } else if (emailDomain && !personalDomains.includes(emailDomain)) {
    details.push({ reason: 'Company/business email', points: 15 });
    total += 15;
  }

  // Status scoring
  const statusPoints: Record<LeadStatus, number> = {
    New: 0,
    Contacted: 10,
    Qualified: 20,
    Converted: 30,
    Lost: -10,
  };
  if (statusPoints[input.status] !== 0) {
    details.push({ reason: `Status: ${input.status}`, points: statusPoints[input.status] });
    total += statusPoints[input.status];
  }

  // Notes scoring
  if (input.notes && input.notes.trim().length > 100) {
    details.push({ reason: 'Detailed notes (>100 chars)', points: 10 });
    total += 10;
  } else if (input.notes && input.notes.trim().length > 20) {
    details.push({ reason: 'Has notes', points: 5 });
    total += 5;
  }

  // Company scoring
  if (input.company && input.company.trim().length > 0) {
    details.push({ reason: 'Company provided', points: 10 });
    total += 10;
  }

  // Clamp between 0 and 100
  total = Math.max(0, Math.min(100, total));

  return { total, details };
};
