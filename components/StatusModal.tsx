'use client';

import { Dialog } from '@headlessui/react';
import {
  XMarkIcon,
  InformationCircleIcon,
  SparklesIcon,
  ArrowPathRoundedSquareIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useStatus } from '@/lib/contexts/StatusContext';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatusModal({ isOpen, onClose }: StatusModalProps) {
    const { r1fsStatus, cstoreStatus, isLoading, error, r1fsError, cstoreError, refresh } = useStatus();
  const [showCStore, setShowCStore] = useState(false);

  const renderValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="card-glass p-8 w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Enhanced Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-ratio1-500 via-purple-500 to-ratio1-600 p-3 rounded-xl shadow-lg">
                  <InformationCircleIcon className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <SparklesIcon className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <Dialog.Title className="text-2xl font-bold gradient-text">
                  Current Node Status
                </Dialog.Title>
                <p className="text-sm text-gray-600">Detailed information about your Ratio1 Drive node</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-ratio1-200 border-t-ratio1-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
              </div>
            )}

            {/* R1FS Status Section */}
            <div className={`backdrop-blur-sm rounded-xl p-6 border ${
              r1fsError ? 'bg-red-50/60 border-red-200/50' : 'bg-white/60 border-gray-200/50'
            }`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                R1FS Status Data
                {r1fsError && (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 ml-2" title={r1fsError} />
                )}
              </h3>

              {r1fsError ? (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-800">R1FS Service Error</h4>
                      <p className="text-red-700 mt-1">{r1fsError}</p>
                    </div>
                  </div>
                </div>
              ) : r1fsStatus ? (
                <div className="space-y-4">
                  {Object.entries(r1fsStatus).map(([key, value]) => key != 'result' && (
                    <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900 text-sm bg-white px-2 py-1 rounded border">
                          {key}
                        </span>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono overflow-x-auto">
                          {renderValue(value)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No R1FS status data available
                </div>
              )}
            </div>

            {/* CStore Section - Collapsible */}
            <div className={`backdrop-blur-sm rounded-xl p-6 border ${
              cstoreError ? 'bg-red-50/60 border-red-200/50' : 'bg-white/60 border-gray-200/50'
            }`}>
              <button
                onClick={() => setShowCStore(!showCStore)}
                className="flex items-center justify-between w-full text-left mb-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  CStore Status Data
                  {cstoreError && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 ml-2" title={cstoreError} />
                  )}
                </h3>
                {showCStore ? (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {showCStore && (
                <>
                  {cstoreError ? (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center space-x-3">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-red-800">CStore Service Error</h4>
                          <p className="text-red-700 mt-1">{cstoreError}</p>
                        </div>
                      </div>
                    </div>
                  ) : cstoreStatus ? (
                    <div className="space-y-4">
                      {Object.entries(cstoreStatus).map(([key, value]) => key != 'result' && (
                        <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-900 text-sm bg-white px-2 py-1 rounded border">
                              {key}
                            </span>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono overflow-x-auto">
                              {renderValue(value)}
                            </pre>
                          </div>
                        </div>
                      ))}

                      {/* Chainstore Peers Section */}
                      {cstoreStatus?.chainstore_peers && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-900 text-sm bg-white px-2 py-1 rounded border">
                              chainstore_peers
                            </span>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono overflow-x-auto">
                              {JSON.stringify(cstoreStatus.chainstore_peers, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      No CStore status data available
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={refresh}
              className="btn-secondary flex items-center space-x-2"
              disabled={isLoading}
            >
              <ArrowPathRoundedSquareIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
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
