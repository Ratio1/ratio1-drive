'use client';

import { Dialog } from '@headlessui/react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useStatus } from '@/lib/contexts/StatusContext';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatusModal({ isOpen, onClose }: StatusModalProps) {
  const { status, isLoading, error, refresh } = useStatus();

  const renderValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="card p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-ratio1-500 to-purple-500 p-2 rounded-lg">
                <InformationCircleIcon className="h-6 w-6 text-white" />
              </div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                System Status
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ratio1-500"></div>
                <span className="ml-3 text-gray-600">Loading status...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {status && !isLoading && !error && (
              <div className="space-y-4">
                {Object.entries(status).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-900 text-sm">{key}</span>
                    </div>
                    <div className="mt-2">
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-white p-3 rounded border overflow-x-auto">
                        {renderValue(value)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button onClick={refresh} className="btn-secondary" disabled={isLoading}>
              Refresh
            </button>
            <button onClick={onClose} className="btn-primary">
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
