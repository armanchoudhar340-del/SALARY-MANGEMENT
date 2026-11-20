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

    // Subscribe to all tables for instant multi-device sync
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employees' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['employees'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          setLastSyncedAt(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['attendance'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['monthly-records'] });
          setLastSyncedAt(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'salary_transactions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['monthly-records'] });
          setLastSyncedAt(new Date());
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'monthly_salary_records' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['monthly-records'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          setLastSyncedAt(new Date());
        }
      )
      .subscribe((status) => {
        setIsLiveConnected(status === 'SUBSCRIBED');
      });

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  const triggerManualSync = async () => {
    setIsSyncing(true);
    await queryClient.invalidateQueries();
    setLastSyncedAt(new Date());
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
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
