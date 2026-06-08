'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Download, SlidersHorizontal, ChevronUp, ChevronDown,
  Eye, Edit2, Trash2, ChevronLeft, ChevronRight, X, RotateCcw,
} from 'lucide-react';
import { Lead, LeadFilters } from '@/types';
import { LEAD_STATUSES } from '@/constants';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LeadScore } from '@/components/common/LeadScore';
import { EmptyState } from '@/components/common/EmptyState';
import { TableRowSkeleton } from '@/components/common/Skeleton';
import { formatDate, cn } from '@/utils/cn';
import { PaginationMeta } from '@/types';

interface LeadTableProps {
  leads: Lead[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  filters: LeadFilters;
  onFilterChange: <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onAddLead: () => void;
  onExport: () => void;
}

type SortField = 'name' | 'createdAt' | 'status' | 'score';

export function LeadTable({
  leads, pagination, isLoading, filters,
  onFilterChange, onResetFilters, onPageChange,
  onView, onEdit, onDelete, onAddLead, onExport,
}: LeadTableProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (field: SortField) => {
    if (filters.sortBy === field) {
      onFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onFilterChange('sortBy', field);
      onFilterChange('sortOrder', 'desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (filters.sortBy !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return filters.sortOrder === 'asc'
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  const hasActiveFilters =
    filters.status || filters.company || filters.startDate || filters.endDate;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors',
                showFilters || hasActiveFilters
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-input hover:bg-muted text-foreground'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </button>

            <button
              onClick={onExport}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-input bg-background hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={onAddLead}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Lead</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl border border-border bg-muted/30 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => onFilterChange('status', e.target.value as LeadFilters['status'])}
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">All</option>
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Company */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Company</label>
                  <input
                    type="text"
                    placeholder="Filter by company..."
                    value={filters.company}
                    onChange={(e) => onFilterChange('company', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* Date range */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">From Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => onFilterChange('startDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">To Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => onFilterChange('endDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {hasActiveFilters && (
                  <div className="col-span-2 sm:col-span-4 flex justify-end">
                    <button
                      onClick={onResetFilters}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {[
                  { label: 'Name', field: 'name' as SortField },
                  { label: 'Company', field: null },
                  { label: 'Status', field: 'status' as SortField },
                  { label: 'Score', field: 'score' as SortField },
                  { label: 'Created', field: 'createdAt' as SortField },
                  { label: 'Actions', field: null },
                ].map(({ label, field }) => (
                  <th
                    key={label}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap',
                      field && 'cursor-pointer hover:text-foreground select-none'
                    )}
                    onClick={() => field && handleSort(field)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {field && <SortIcon field={field} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={6}><TableRowSkeleton /></td></tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No leads found"
                      description="Try adjusting your filters or add a new lead to get started."
                      action={
                        <button
                          onClick={onAddLead}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add First Lead
                        </button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                <AnimatePresence initial={false}>
                  {leads.map((lead, i) => (
                    <motion.tr
                      key={lead._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                    >
                      {/* Name + Email */}
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => onView(lead)}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors">
                              {lead.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">{lead.company}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={lead.status} />
                      </td>

                      {/* Score */}
                      <td className="px-4 py-3">
                        <LeadScore score={lead.score} size="sm" />
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(lead.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onView(lead)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEdit(lead)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit lead"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(lead)}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} leads
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="p-1.5 rounded-md border border-input bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={cn(
                      'w-7 h-7 text-xs rounded-md border transition-colors',
                      p === pagination.page
                        ? 'bg-primary text-primary-foreground border-primary font-semibold'
                        : 'border-input bg-background hover:bg-muted text-foreground'
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="p-1.5 rounded-md border border-input bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
