'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { useStats } from '@/hooks/useStats';

export function DashboardClient() {
  const { stats, isLoading, refetch } = useStats();

  // Listen for lead refresh events (from command palette add)
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener('leads:refresh', handler);
    return () => window.removeEventListener('leads:refresh', handler);
  }, [refetch]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of your lead pipeline and performance
        </p>
      </motion.div>

      <DashboardStats stats={stats} isLoading={isLoading} />
    </div>
  );
}
