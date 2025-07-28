'use client';

import { useStatus } from '@/lib/contexts/StatusContext';
import { SignalIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function DualStatusWidget() {
  const { r1fsStatus, cstoreStatus, isLoading, error, r1fsError, cstoreError } = useStatus();

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {/* R1FS Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          r1fsStatus && !r1fsError ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}></div>
        <span className="text-xs font-medium text-gray-700">R1FS</span>
        <span className={`text-xs ${
          r1fsStatus && !r1fsError ? 'text-green-600' : 'text-red-600'
        }`}>
          {r1fsStatus && !r1fsError ? 'Online' : 'Offline'}
        </span>
        {r1fsError && (
          <span className="text-xs text-red-500 ml-1" title={r1fsError}>
            ⚠
          </span>
        )}
      </div>

      {/* CStore Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          cstoreStatus && !cstoreError ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}></div>
        <span className="text-xs font-medium text-gray-700">CStore</span>
        <span className={`text-xs ${
          cstoreStatus && !cstoreError ? 'text-green-600' : 'text-red-600'
        }`}>
          {cstoreStatus && !cstoreError ? 'Online' : 'Offline'}
        </span>
        {cstoreError && (
          <span className="text-xs text-red-500 ml-1" title={cstoreError}>
            ⚠
          </span>
        )}
      </div>
    </div>
  );
} 