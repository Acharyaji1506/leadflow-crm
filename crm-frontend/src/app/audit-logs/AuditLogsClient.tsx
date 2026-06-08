'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { auditLogsApi } from '@/services/api';
import { AuditLog, PaginationMeta } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDateTime } from '@/utils/cn';
import { cn } from '@/utils/cn';

const ACTION_STYLES: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  LEAD_CREATED: { label: 'Created', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50', icon: '✦' },
  LEAD_UPDATED: { label: 'Updated', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/50', icon: '✎' },
  STATUS_CHANGED: { label: 'Status Changed', color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/50', icon: '⇄' },
  LEAD_DELETED: { label: 'Deleted', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50', icon: '✕' },
};

export function AuditLogsClient() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchLogs = async (p = page) => {
    setIsLoading(true);
    try {
      const result = await auditLogsApi.getAll(p, 20);
      setLogs(result.logs);
      setPagination(result.pagination);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Complete history of all lead activities
          </p>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-input hover:bg-muted transition-colors text-muted-foreground"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      {/* Log list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No audit logs yet"
            description="Actions like creating, updating, or deleting leads will appear here."
          />
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr] gap-4 px-5 py-3 border-b border-border bg-muted/40">
              {['Lead', 'Action', 'Lead ID', 'Timestamp'].map((h) => (
                <span key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {h}
                </span>
              ))}
            </div>

            <AnimatePresence initial={false}>
              {logs.map((log, i) => {
                const style = ACTION_STYLES[log.action] || {
                  label: log.action, color: 'text-foreground', bg: 'bg-muted', icon: '•',
                };
                return (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr] gap-4 px-5 py-3.5 border-b border-border/50 hover:bg-muted/20 transition-colors items-center"
                  >
                    {/* Lead name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {log.leadName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground truncate">{log.leadName}</span>
                    </div>

                    {/* Action badge */}
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit',
                      style.color, style.bg
                    )}>
                      <span>{style.icon}</span>
                      {style.label}
                    </span>

                    {/* Lead ID */}
                    <span className="text-xs text-muted-foreground font-mono truncate">
                      ...{log.leadId.slice(-6)}
                    </span>

                    {/* Timestamp */}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {pagination.total} total entries · Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPrev}
                className="p-1.5 rounded-md border border-input bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext}
                className="p-1.5 rounded-md border border-input bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
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
