'use client';

import { useStatus, useEeId, useStatusValue } from '@/lib/contexts/StatusContext';

export default function StatusWidget() {
  const { isLoading, error } = useStatus();
  const eeId = useEeId();
  const serverAlias = useStatusValue<string>('server_alias');
  const serverVersion = useStatusValue<string>('server_version');

  if (isLoading) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Loading status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-sm text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-gray-900 mb-2">System Status</h3>
      <div className="space-y-1 text-xs text-gray-600">
        {eeId && <div>EE ID: {eeId}</div>}
        {serverAlias && <div>Server: {serverAlias}</div>}
        {serverVersion && <div>Version: {serverVersion}</div>}
      </div>
    </div>
  );
} 