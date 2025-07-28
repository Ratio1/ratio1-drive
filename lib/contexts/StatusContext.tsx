'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '@/lib/services/api-service';

interface StatusData {
  [key: string]: any;
  ee_node_address?: string;
}

interface StatusContextType {
  r1fsStatus: StatusData | null;
  cstoreStatus: StatusData | null;
  isLoading: boolean;
  error: string | null;
  r1fsError: string | null;
  cstoreError: string | null;
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
  const [r1fsError, setR1FSError] = useState<string | null>(null);
  const [cstoreError, setCStoreError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setR1FSError(null);
    setCStoreError(null);

    try {
      const [r1fsResult, cstoreResult] = await Promise.allSettled([
        apiService.getR1FSStatus(),
        apiService.getCStoreStatus()
      ]);

      // Handle R1FS status
      if (r1fsResult.status === 'fulfilled') {
        setR1FSStatus(r1fsResult.value);
        setR1FSError(null);
      } else {
        setR1FSStatus(null);
        setR1FSError(r1fsResult.reason instanceof Error ? r1fsResult.reason.message : 'R1FS service unavailable');
      }

      // Handle CStore status
      if (cstoreResult.status === 'fulfilled') {
        setCStoreStatus(cstoreResult.value);
        setCStoreError(null);
      } else {
        setCStoreStatus(null);
        setCStoreError(cstoreResult.reason instanceof Error ? cstoreResult.reason.message : 'CStore service unavailable');
      }

      // Set general error if both services failed
      if (r1fsResult.status === 'rejected' && cstoreResult.status === 'rejected') {
        setError('All services are unavailable');
      } else if (r1fsResult.status === 'rejected' || cstoreResult.status === 'rejected') {
        setError('Some services are unavailable');
      } else {
        setError(null);
      }
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
    r1fsError,
    cstoreError,
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
  const { r1fsStatus, cstoreStatus } = useStatus();
  return r1fsStatus?.ee_node_address || cstoreStatus?.ee_node_address || '';
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