'use client';
import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { LeadModal } from '@/components/leads/LeadModal';
import { leadsApi } from '@/services/api';
import { LeadFormData } from '@/types';
import toast from 'react-hot-toast';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddLead = useCallback(() => setModalOpen(true), []);

  const handleSubmit = async (data: LeadFormData) => {
    setIsCreating(true);
    try {
      await leadsApi.create(data);
      toast.success('Lead created successfully!');
      setModalOpen(false);
      // Trigger a page refresh of the leads data
      window.dispatchEvent(new CustomEvent('leads:refresh'));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create lead';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette onAddLead={handleAddLead} />

      {/* Global Add Lead Modal */}
      <LeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={isCreating}
      />
    </div>
  );
}
