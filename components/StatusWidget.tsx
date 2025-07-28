'use client';

import { useStatus, useEeId, useStatusValue, useCStoreStatusValue } from '@/lib/contexts/StatusContext';

export default function StatusWidget() {
  const { r1fsStatus, cstoreStatus, isLoading, error, r1fsError, cstoreError } = useStatus();
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

  return (
    <div className="space-y-4">
      {/* R1FS Status */}
      <div className={`border p-4 rounded-lg shadow-sm ${
        r1fsError ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
      }`}>
        <h3 className="text-sm font-medium text-gray-900 mb-2">R1FS Status</h3>
        {r1fsError ? (
          <div className="space-y-1 text-xs">
            <div className="text-red-600">Error: {r1fsError}</div>
          </div>
        ) : (
          <div className="space-y-1 text-xs text-gray-600">
            {eeId && <div>EE ID: {eeId}</div>}
            {serverAlias && <div>Server: {serverAlias}</div>}
            {serverVersion && <div>Version: {serverVersion}</div>}
            <div className="text-green-600">Status: Online</div>
          </div>
        )}
      </div>

      {/* CStore Status */}
      <div className={`border p-4 rounded-lg shadow-sm ${
        cstoreError ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
      }`}>
        <h3 className="text-sm font-medium text-gray-900 mb-2">CStore Status</h3>
        {cstoreError ? (
          <div className="space-y-1 text-xs">
            <div className="text-red-600">Error: {cstoreError}</div>
          </div>
        ) : (
          <div className="space-y-1 text-xs text-gray-600">
            <div className="text-green-600">Status: Connected</div>
          </div>
        )}
      </div>
    </div>
  );
} 