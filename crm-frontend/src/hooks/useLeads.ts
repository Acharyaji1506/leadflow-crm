'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { leadsApi, GetLeadsParams } from '@/services/api';
import { Lead, PaginationMeta, LeadFilters } from '@/types';
import toast from 'react-hot-toast';

const DEFAULT_FILTERS: LeadFilters = {
  search: '',
  status: '',
  company: '',
  startDate: '',
  endDate: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function useLeads(pageSize = 10) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [filters.search]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: GetLeadsParams = {
        page,
        limit: pageSize,
        search: debouncedSearch,
        status: filters.status || undefined,
        company: filters.company || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      const result = await leadsApi.getAll(params);
      setLeads(result.leads);
      setPagination(result.pagination);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, filters.status, filters.company, filters.startDate, filters.endDate, filters.sortBy, filters.sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateFilter = useCallback(<K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key !== 'search') setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  return {
    leads,
    pagination,
    isLoading,
    page,
    setPage,
    filters,
    updateFilter,
    resetFilters,
    refetch: fetchLeads,
  };
}
