'use client';

import { StatusProvider } from '@/lib/contexts/StatusContext';
import { UserProvider } from '@/lib/contexts/UserContext';
import { ToastProvider } from '@/lib/contexts/ToastContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      <UserProvider>
        <StatusProvider>
          {children}
        </StatusProvider>
      </UserProvider>
    </ToastProvider>
  );
} 