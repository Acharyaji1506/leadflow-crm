'use client';
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LeadTable } from '@/components/leads/LeadTable';
import { LeadModal } from '@/components/leads/LeadModal';
import { LeadDrawer } from '@/components/leads/LeadDrawer';
import { useLeads } from '@/hooks/useLeads';
import { leadsApi } from '@/services/api';
import { Lead, LeadFormData } from '@/types';

export function LeadsClient() {
  const {
    leads, pagination, isLoading, page, setPage,
    filters, updateFilter, resetFilters, refetch,
  } = useLeads(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Listen for global lead add events (from AppShell / CommandPalette)
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener('leads:refresh', handler);
    return () => window.removeEventListener('leads:refresh', handler);
  }, [refetch]);

  /* ── Handlers ── */
  const handleAddLead = useCallback(() => {
    setEditingLead(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((lead: Lead) => {
    setDrawerOpen(false);
    setEditingLead(lead);
    setModalOpen(true);
  }, []);

  const handleView = useCallback((lead: Lead) => {
    setDrawerLead(lead);
    setDrawerOpen(true);
  }, []);

  const handleDelete = useCallback((lead: Lead) => {
    // Optimistic removal with undo toast
    const toastId = toast.loading('Deleting lead...');
    let undone = false;

    leadsApi.delete(lead._id).then(() => {
      refetch();
      toast.dismiss(toastId);
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-sm">
              <strong>{lead.name}</strong> deleted
            </span>
            <button
              onClick={() => {
                undone = true;
                toast.dismiss(t.id);
                // Re-create the lead since backend delete is permanent
                leadsApi.create({
                  name: lead.name,
                  email: lead.email,
                  phone: lead.phone,
                  company: lead.company,
                  status: lead.status,
                  notes: lead.notes,
                }).then(() => {
                  refetch();
                  toast.success('Lead restored!');
                }).catch(() => toast.error('Could not restore lead'));
              }}
              className="text-xs font-medium text-primary hover:underline"
            >
              Undo
            </button>
          </div>
        ),
        { duration: 5000 }
      );
      if (drawerOpen && drawerLead?._id === lead._id) {
        setDrawerOpen(false);
      }
    }).catch(() => {
      toast.dismiss(toastId);
      toast.error('Failed to delete lead');
    });
  }, [refetch, drawerOpen, drawerLead]);

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
      const message = err instanceof Error ? err.message : 'Save failed';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      await leadsApi.exportCSV();
      toast.success('CSV exported successfully!');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="text-xl font-bold text-foreground">Leads</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage and track all your leads
        </p>
      </motion.div>

      {/* Lead Table */}
      <div className="flex-1 min-h-0">
        <LeadTable
          leads={leads}
          pagination={pagination}
          isLoading={isLoading}
          filters={filters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          onPageChange={setPage}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddLead={handleAddLead}
          onExport={handleExport}
        />
      </div>

      {/* Create/Edit Modal */}
      <LeadModal
        open={modalOpen}
        lead={editingLead}
        onClose={() => { setModalOpen(false); setEditingLead(null); }}
        onSubmit={handleModalSubmit}
        isLoading={isSaving}
      />

      {/* Lead Details Drawer */}
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
