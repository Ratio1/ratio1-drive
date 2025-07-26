'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '@/lib/services/api-service';

interface StatusData {
  [key: string]: any;
  EE_ID?: string;
}

interface StatusContextType {
  status: StatusData | null;
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
  const [status, setStatus] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiService.getStatus();
      setStatus(data);
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
    status,
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
  const { status } = useStatus();
  return status?.EE_ID || '';
}

export function useStatusValue<T = any>(key: string): T | undefined {
  const { status } = useStatus();
  return status?.[key] as T;
} 