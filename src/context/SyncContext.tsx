import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

interface SyncContextType {
  isLiveConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  triggerManualSync: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiveConnected, setIsLiveConnected] = useState(isSupabaseConfigured);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLiveConnected(false);
      return;
    }

    // Batch bursts of realtime changes so one database update causes one refresh.
    const pendingQueryKeys = new Set<string>();
    let invalidationTimer: number | undefined;
    const scheduleInvalidation = (...queryKeys: string[]) => {
      queryKeys.forEach((key) => pendingQueryKeys.add(key));
      if (invalidationTimer) window.clearTimeout(invalidationTimer);
      invalidationTimer = window.setTimeout(() => {
        pendingQueryKeys.forEach((key) => {
          void queryClient.invalidateQueries({ queryKey: [key], refetchType: 'active' });
        });
        pendingQueryKeys.clear();
        setLastSyncedAt(new Date());
      }, 150);
    };

    // Subscribe to all tables for instant multi-device sync.
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employees' },
        () => {
          scheduleInvalidation('employees', 'dashboard-stats', 'monthly-records');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => {
          scheduleInvalidation('attendance', 'dashboard-stats', 'monthly-records');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'salary_transactions' },
        () => {
          scheduleInvalidation('transactions', 'dashboard-stats', 'monthly-records');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'monthly_salary_records' },
        () => {
          scheduleInvalidation('monthly-records', 'dashboard-stats');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fuel_logs' },
        () => scheduleInvalidation('fuel-logs')
      )
      .subscribe((status) => {
        setIsLiveConnected(status === 'SUBSCRIBED');
      });

    return () => {
      if (invalidationTimer) window.clearTimeout(invalidationTimer);
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  const triggerManualSync = async () => {
    setIsSyncing(true);
    try {
      await queryClient.refetchQueries({ type: 'active' });
      setLastSyncedAt(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SyncContext.Provider
      value={{
        isLiveConnected,
        isSyncing,
        lastSyncedAt,
        triggerManualSync,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
