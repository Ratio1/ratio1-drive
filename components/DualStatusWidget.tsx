'use client';

import { useStatus } from '@/lib/contexts/StatusContext';
import { SignalIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function DualStatusWidget() {
  const { r1fsStatus, cstoreStatus, isLoading, error } = useStatus();

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

  if (error) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
          <span className="text-xs text-red-600">Error</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {/* R1FS Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          r1fsStatus ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}></div>
        <span className="text-xs font-medium text-gray-700">R1FS</span>
        <span className={`text-xs ${
          r1fsStatus ? 'text-green-600' : 'text-red-600'
        }`}>
          {r1fsStatus ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* CStore Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          cstoreStatus ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}></div>
        <span className="text-xs font-medium text-gray-700">CStore</span>
        <span className={`text-xs ${
          cstoreStatus ? 'text-green-600' : 'text-red-600'
        }`}>
          {cstoreStatus ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
} 