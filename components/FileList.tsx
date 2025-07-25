'use client';

import { useState } from 'react';
import { DocumentIcon, ArrowDownTrayIcon, InformationCircleIcon, CalendarIcon, ServerIcon, CpuChipIcon, StarIcon } from '@heroicons/react/24/outline';
import { FilesData, FileMetadata } from '@/lib/types';
import { useStatus } from '@/lib/contexts/StatusContext';
import DownloadModal from './DownloadModal';
import StatusModal from './StatusModal';

interface FileListProps {
  files: FilesData;
  transferMode: 'streaming' | 'base64';
  onRefresh: () => void;
}

export default function FileList({ files, transferMode, onRefresh }: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { status } = useStatus();

  const handleDownloadClick = (file: FileMetadata) => {
    setSelectedFile(file);
    setShowDownloadModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalFiles = () => {
    return Object.values(files).reduce((total, machineFiles) => total + machineFiles.length, 0);
  };

  // Get the current node's address from status
  const getCurrentNodeAddress = () => {
    return status?.server_node_addr || status?.ee_node_address || null;
  };

  // Check if a machine is the current node
  const isCurrentNode = (machine: string) => {
    const currentNodeAddress = getCurrentNodeAddress();
    return currentNodeAddress && machine === currentNodeAddress;
  };

  return (
    <div className="space-y-8">
      {/* Node Information Section */}
      {status && (
        <div className="bg-gradient-to-r from-ratio1-50 to-purple-50 border border-ratio1-200 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-ratio1-500 to-purple-500 p-3 rounded-lg">
              <CpuChipIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Node Information</h3>
              <div className="mt-2 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Node Alias:</span>
                  <span className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                    {status.ee_node_alias || 'N/A'}
                  </span>
                </div>
                {status.EE_ID && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">EE ID:</span>
                    <span className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                      {status.EE_ID}
                    </span>
                  </div>
                )}
                {getCurrentNodeAddress() && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Node Address:</span>
                    <span className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                      {getCurrentNodeAddress()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Files</h2>
          <span className="bg-ratio1-100 text-ratio1-800 px-3 py-1 rounded-full text-sm font-medium">
            {getTotalFiles()} files
          </span>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowStatusModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <InformationCircleIcon className="h-5 w-5" />
            <span>Detailed Info</span>
          </button>
          <button
            onClick={onRefresh}
            className="btn-primary"
          >
            Refresh
          </button>
        </div>
      </div>

      {Object.entries(files)
        .sort(([machineA], [machineB]) => {
          // Sort current node to the top
          const isCurrentA = isCurrentNode(machineA);
          const isCurrentB = isCurrentNode(machineB);
          if (isCurrentA && !isCurrentB) return -1;
          if (!isCurrentA && isCurrentB) return 1;
          return 0;
        })
        .map(([machine, machineFiles]) => {
          const isCurrent = isCurrentNode(machine);
          return (
            <div 
              key={machine} 
              className={`card p-6 ${isCurrent ? 'bg-gradient-to-r from-ratio1-50 to-purple-50 border-2 border-ratio1-300 shadow-lg' : ''}`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-3 rounded-lg ${isCurrent ? 'bg-gradient-to-br from-ratio1-500 to-purple-500' : 'bg-gradient-to-br from-gray-100 to-gray-200'}`}>
                  {isCurrent ? (
                    <StarIcon className="h-6 w-6 text-white" />
                  ) : (
                    <ServerIcon className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-semibold text-gray-900">{machine}</h3>
                    {isCurrent && (
                      <span className="bg-ratio1-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Current Node
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{machineFiles.length} files</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {machineFiles.map((file) => (
                  <div
                    key={file.cid}
                    className={`rounded-lg p-4 transition-colors duration-200 ${
                      isCurrent 
                        ? 'bg-white border border-ratio1-200 hover:bg-ratio1-50 shadow-sm' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg shadow-sm ${
                          isCurrent ? 'bg-ratio1-100' : 'bg-white'
                        }`}>
                          <DocumentIcon className={`h-5 w-5 ${
                            isCurrent ? 'text-ratio1-600' : 'text-ratio1-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate" title={file.filename}>
                            {file.filename}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <p className="text-xs text-gray-500">
                              {formatDate(file.date_uploaded)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 font-mono mt-1 truncate" title={file.cid}>
                            {file.cid}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadClick(file)}
                        className={`ml-3 p-2 rounded-lg transition-colors duration-200 ${
                          isCurrent 
                            ? 'text-ratio1-600 hover:text-ratio1-700 hover:bg-ratio1-100' 
                            : 'text-ratio1-600 hover:text-ratio1-700 hover:bg-ratio1-50'
                        }`}
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {Object.keys(files).length === 0 && (
        <div className="text-center py-12">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
          <p className="mt-1 text-sm text-gray-500">Upload your first file to get started.</p>
        </div>
      )}

      {selectedFile && (
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => {
            setShowDownloadModal(false);
            setSelectedFile(null);
          }}
          file={selectedFile}
          transferMode={transferMode}
        />
      )}

      <StatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
      />
    </div>
  );
}
