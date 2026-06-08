'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Lead, LeadFormData } from '@/types';
import { LeadForm } from './LeadForm';

interface LeadModalProps {
  open: boolean;
  lead?: Lead | null;
  onClose: () => void;
  onSubmit: (data: LeadFormData) => Promise<void>;
  isLoading?: boolean;
}

export function LeadModal({ open, lead, onClose, onSubmit, isLoading }: LeadModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed left-1/2 top-[5%] -translate-x-1/2 w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {lead ? 'Edit Lead' : 'Add New Lead'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lead ? 'Update lead information' : 'Fill in the details to add a new lead'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              <LeadForm
                lead={lead}
                onSubmit={onSubmit}
                onCancel={onClose}
                isLoading={isLoading}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
