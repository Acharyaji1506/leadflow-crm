'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Building2, Calendar, Clock, Edit2, Trash2, FileText } from 'lucide-react';
import { Lead } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LeadScore } from '@/components/common/LeadScore';
import { formatDateTime, timeAgo } from '@/utils/cn';
import { TIMELINE_ACTION_LABELS } from '@/constants';
import { cn } from '@/utils/cn';

interface LeadDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export function LeadDrawer({ lead, open, onClose, onEdit, onDelete }: LeadDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const timelineIcons: Record<string, string> = {
    LEAD_CREATED: '✦',
    LEAD_UPDATED: '✎',
    STATUS_CHANGED: '⇄',
    LEAD_DELETED: '✕',
  };

  return (
    <AnimatePresence>
      {open && lead && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-start justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <h2 className="text-base font-semibold text-foreground truncate">{lead.name}</h2>
                <p className="text-sm text-muted-foreground truncate">{lead.company}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(lead)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(lead)}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {/* Score + Status */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Lead Score</p>
                  <LeadScore score={lead.score} size="lg" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <StatusBadge status={lead.status} />
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-primary hover:underline truncate"
                    >
                      {lead.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{lead.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{lead.company}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground">Created {formatDateTime(lead.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground">Updated {timeAgo(lead.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {lead.notes && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Notes
                  </h3>
                  <div className="p-3 rounded-lg bg-muted/50 border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {lead.notes}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {lead.timeline && lead.timeline.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Activity Timeline
                  </h3>
                  <div className="relative">
                    <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border" />
                    <div className="space-y-4">
                      {[...lead.timeline].reverse().map((entry, i) => (
                        <div key={i} className="flex gap-3 relative">
                          <div className="w-7 h-7 rounded-full bg-muted border flex items-center justify-center shrink-0 text-xs z-10">
                            {timelineIcons[entry.action] || '•'}
                          </div>
                          <div className="flex-1 pt-0.5">
                            <p className="text-sm font-medium text-foreground">
                              {TIMELINE_ACTION_LABELS[entry.action] || entry.action}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
                            <p className="text-xs text-muted-foreground/70 mt-0.5">
                              {timeAgo(entry.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
