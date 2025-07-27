'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '@/lib/services/api-service';

interface StatusData {
  [key: string]: any;
  EE_ID?: string;
}

interface StatusContextType {
  r1fsStatus: StatusData | null;
  cstoreStatus: StatusData | null;
  isLoading: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  refresh: () => Promise<void>;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

interface StatusProviderProps {
  children: ReactNode;
}

export function StatusProvider({ children }: StatusProviderProps) {
  const [r1fsStatus, setR1FSStatus] = useState<StatusData | null>(null);
  const [cstoreStatus, setCStoreStatus] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [r1fsData, cstoreData] = await Promise.all([
        apiService.getR1FSStatus(),
        apiService.getCStoreStatus()
      ]);
      setR1FSStatus(r1fsData);
      setCStoreStatus(cstoreData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const value: StatusContextType = {
    r1fsStatus,
    cstoreStatus,
    isLoading,
    error,
    fetchStatus,
    refresh,
  };

  return (
    <StatusContext.Provider value={value}>
      {children}
    </StatusContext.Provider>
  );
}

export function useStatus() {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
}

// Convenience hooks for specific status data
export function useEeId(): string {
  const { r1fsStatus } = useStatus();
  return r1fsStatus?.EE_ID || '';
}

export function useStatusValue<T = any>(key: string): T | undefined {
  const { r1fsStatus } = useStatus();
  return r1fsStatus?.[key] as T;
}

// Convenience hooks for CStore status data
export function useCStoreStatusValue<T = any>(key: string): T | undefined {
  const { cstoreStatus } = useStatus();
  return cstoreStatus?.[key] as T;
} 