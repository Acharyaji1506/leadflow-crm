export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';

export interface TimelineEntry {
  action: string;
  description: string;
  timestamp: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  notes: string;
  score: number;
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  notes: string;
}

export interface LeadStats {
  total: number;
  New: number;
  Contacted: number;
  Qualified: number;
  Converted: number;
  Lost: number;
  conversionRate: number;
  lostRate: number;
  avgPerDay: number;
}

export interface AuditLog {
  _id: string;
  action: string;
  leadId: string;
  leadName: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface LeadFilters {
  search: string;
  status: LeadStatus | '';
  company: string;
  startDate: string;
  endDate: string;
  sortBy: 'name' | 'createdAt' | 'status' | 'score';
  sortOrder: 'asc' | 'desc';
}
