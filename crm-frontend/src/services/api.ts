import { API_URL } from '@/constants';
import { Lead, LeadFormData, ApiResponse, LeadStats, AuditLog, PaginationMeta, LeadFilters } from '@/types';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data.message || 'Something went wrong');
  }

  return data;
}

export interface GetLeadsParams extends Partial<LeadFilters> {
  page?: number;
  limit?: number;
}

export interface GetLeadsResult {
  leads: Lead[];
  pagination: PaginationMeta;
}

export const leadsApi = {
  async getAll(params: GetLeadsParams = {}): Promise<GetLeadsResult> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.company) query.set('company', params.company);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    const result = await fetchJson<ApiResponse<Lead[]>>(
      `${API_URL}/leads?${query.toString()}`
    );
    return {
      leads: result.data,
      pagination: result.pagination!,
    };
  },

  async getById(id: string): Promise<Lead> {
    const result = await fetchJson<ApiResponse<Lead>>(`${API_URL}/leads/${id}`);
    return result.data;
  },

  async create(data: LeadFormData): Promise<Lead> {
    const result = await fetchJson<ApiResponse<Lead>>(`${API_URL}/leads`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data;
  },

  async update(id: string, data: Partial<LeadFormData>): Promise<Lead> {
    const result = await fetchJson<ApiResponse<Lead>>(`${API_URL}/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result.data;
  },

  async delete(id: string): Promise<Lead> {
    const result = await fetchJson<ApiResponse<Lead>>(`${API_URL}/leads/${id}`, {
      method: 'DELETE',
    });
    return result.data;
  },

  async getStats(): Promise<LeadStats> {
    const result = await fetchJson<ApiResponse<LeadStats>>(`${API_URL}/leads/stats`);
    return result.data;
  },

  async exportCSV(): Promise<void> {
    const res = await fetch(`${API_URL}/leads/export/csv`);
    if (!res.ok) throw new ApiError(res.status, 'Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

export const auditLogsApi = {
  async getAll(page = 1, limit = 20): Promise<{ logs: AuditLog[]; pagination: PaginationMeta }> {
    const result = await fetchJson<ApiResponse<AuditLog[]>>(
      `${API_URL}/audit-logs?page=${page}&limit=${limit}`
    );
    return { logs: result.data, pagination: result.pagination! };
  },
};

export { ApiError };
