'use client';

import { StatusProvider } from '@/lib/contexts/StatusContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <StatusProvider>
      {children}
    </StatusProvider>
  );
} 