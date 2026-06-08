'use client';
import { useState, useEffect } from 'react';
import { leadsApi } from '@/services/api';
import { LeadStats } from '@/types';

export function useStats() {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await leadsApi.getStats();
      setStats(data);
    } catch {
      // silently fail, dashboard will show zeros
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, isLoading, refetch: fetchStats };
}
