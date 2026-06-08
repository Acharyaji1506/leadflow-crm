'use client';
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { LeadModal } from '@/components/leads/LeadModal';
import { LeadDrawer } from '@/components/leads/LeadDrawer';
import { useLeads } from '@/hooks/useLeads';
import { leadsApi } from '@/services/api';
import { Lead, LeadFormData, LeadStatus } from '@/types';

export function KanbanClient() {
  const { leads, isLoading, refetch } = useLeads(200); // Load all for kanban
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener('leads:refresh', handler);
    return () => window.removeEventListener('leads:refresh', handler);
  }, [refetch]);

  const handleStatusChange = useCallback(async (leadId: string, newStatus: LeadStatus) => {
    const lead = leads.find((l) => l._id === leadId);
    if (!lead) return;
    try {
      await leadsApi.update(leadId, { status: newStatus });
      toast.success(`Moved to ${newStatus}`);
      refetch();
    } catch {
      toast.error('Failed to update status');
    }
  }, [leads, refetch]);

  const handleView = useCallback((lead: Lead) => {
    setDrawerLead(lead);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((lead: Lead) => {
    setDrawerOpen(false);
    setEditingLead(lead);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback((lead: Lead) => {
    const toastId = toast.loading('Deleting...');
    leadsApi.delete(lead._id).then(() => {
      refetch();
      toast.dismiss(toastId);
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-sm"><strong>{lead.name}</strong> deleted</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                leadsApi.create({
                  name: lead.name, email: lead.email, phone: lead.phone,
                  company: lead.company, status: lead.status, notes: lead.notes,
                }).then(() => { refetch(); toast.success('Restored!'); })
                  .catch(() => toast.error('Restore failed'));
              }}
              className="text-xs font-medium text-primary hover:underline"
            >Undo</button>
          </div>
        ),
        { duration: 5000 }
      );
      if (drawerLead?._id === lead._id) setDrawerOpen(false);
    }).catch(() => { toast.dismiss(toastId); toast.error('Delete failed'); });
  }, [refetch, drawerLead]);

  const handleModalSubmit = async (data: LeadFormData) => {
    setIsSaving(true);
    try {
      if (editingLead) {
        await leadsApi.update(editingLead._id, data);
        toast.success('Lead updated!');
      } else {
        await leadsApi.create(data);
        toast.success('Lead created!');
      }
      setModalOpen(false);
      setEditingLead(null);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-full h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-foreground">Kanban Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Drag & drop leads between stages
          </p>
        </div>
        <button
          onClick={() => { setEditingLead(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          + Add Lead
        </button>
      </motion.div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          leads={leads}
          isLoading={isLoading}
          onView={handleView}
          onStatusChange={handleStatusChange}
          onAddLead={() => { setEditingLead(null); setModalOpen(true); }}
        />
      </div>

      <LeadModal
        open={modalOpen}
        lead={editingLead}
        onClose={() => { setModalOpen(false); setEditingLead(null); }}
        onSubmit={handleModalSubmit}
        isLoading={isSaving}
      />

      <LeadDrawer
        lead={drawerLead}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
