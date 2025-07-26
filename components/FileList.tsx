'use client';

import { useState } from 'react';
import { 
  DocumentIcon, 
  ArrowDownTrayIcon, 
  InformationCircleIcon, 
  CalendarIcon, 
  ServerIcon, 
  CpuChipIcon, 
  StarIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  SignalIcon,
  CogIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline';
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
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

  // Extract ETH address from status data
  const getEthAddress = () => {
    if (!status) return null;
    
    // The ETH address is stored in ee_node_eth_address property
    return status.ee_node_eth_address || null;
  };

  const ethAddress = getEthAddress();

  // Copy to clipboard function
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Current Node Information Section */}
      {status && (
        <div className="card-glass p-8 border-0">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-ratio1-500 via-purple-500 to-ratio1-600 p-4 rounded-2xl shadow-lg">
                <CpuChipIcon className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                <SignalIcon className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-bold gradient-text mb-2">Current Node Information</h3>
                <p className="text-gray-600">Current node status and configuration details</p>
              </div>
              
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {/* Node Alias */}
                 <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center space-x-2">
                       <ServerIcon className="h-4 w-4 text-ratio1-600" />
                       <span className="text-sm font-semibold text-gray-700">Node Alias</span>
                     </div>
                     <button
                       onClick={() => copyToClipboard(status.ee_node_alias || 'N/A', 'nodeAlias')}
                       className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                       title="Copy Node Alias"
                     >
                       {copiedField === 'nodeAlias' ? (
                         <CheckIcon className="h-4 w-4 text-green-600" />
                       ) : (
                         <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                       )}
                     </button>
                   </div>
                   <div className="address-display">
                     {status.ee_node_alias || 'N/A'}
                   </div>
                 </div>

                 {/* ETH Address */}
                 <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center space-x-2">
                       <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                       <span className="text-sm font-semibold text-gray-700">ETH Address</span>
                     </div>
                     {ethAddress && (
                       <button
                         onClick={() => copyToClipboard(ethAddress, 'ethAddress')}
                         className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                         title="Copy ETH Address"
                       >
                         {copiedField === 'ethAddress' ? (
                           <CheckIcon className="h-4 w-4 text-green-600" />
                         ) : (
                           <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                         )}
                       </button>
                     )}
                   </div>
                   <div className="address-display">
                     {ethAddress ? ethAddress : 'Not available'}
                   </div>
                   {!ethAddress && (
                     <p className="text-xs text-gray-500 mt-2">
                       ETH address not found in status data
                     </p>
                   )}
                 </div>

                 {/* Node Address */}
                 {getCurrentNodeAddress() && (
                   <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                     <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center space-x-2">
                         <GlobeAltIcon className="h-4 w-4 text-blue-600" />
                         <span className="text-sm font-semibold text-gray-700">Node Address</span>
                       </div>
                       <button
                         onClick={() => {
                           const address = getCurrentNodeAddress();
                           if (address) copyToClipboard(address, 'nodeAddress');
                         }}
                         className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                         title="Copy Node Address"
                       >
                         {copiedField === 'nodeAddress' ? (
                           <CheckIcon className="h-4 w-4 text-green-600" />
                         ) : (
                           <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                         )}
                       </button>
                     </div>
                     <div className="address-display">
                       {getCurrentNodeAddress()}
                     </div>
                   </div>
                 )}

                 {/* EE ID */}
                 {status.EE_ID && (
                   <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                     <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center space-x-2">
                         <CogIcon className="h-4 w-4 text-purple-600" />
                         <span className="text-sm font-semibold text-gray-700">EE ID</span>
                       </div>
                       <button
                         onClick={() => {
                           if (status.EE_ID) copyToClipboard(status.EE_ID, 'eeId');
                         }}
                         className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                         title="Copy EE ID"
                       >
                         {copiedField === 'eeId' ? (
                           <CheckIcon className="h-4 w-4 text-green-600" />
                         ) : (
                           <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                         )}
                       </button>
                     </div>
                     <div className="address-display">
                       {status.EE_ID}
                     </div>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Files Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-bold gradient-text">Files</h2>
            <div className="bg-gradient-to-r from-ratio1-100 to-purple-100 text-ratio1-800 px-4 py-2 rounded-full text-sm font-semibold border border-ratio1-200">
              {getTotalFiles()} files
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowStatusModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <InformationCircleIcon className="h-5 w-5" />
            <span>Node Status</span>
          </button>
          <button
            onClick={onRefresh}
            className="btn-primary flex items-center space-x-2"
          >
            <ArrowPathRoundedSquareIcon className="h-5 w-5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Enhanced File Groups */}
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
              className={`card p-8 ${isCurrent ? 'card-glass border-2 border-ratio1-300 shadow-xl float-animation' : 'hover:shadow-xl'}`}
            >
              {/* Enhanced Machine Header */}
              <div className="flex items-center space-x-4 mb-8">
                <div className={`relative p-4 rounded-2xl shadow-lg ${
                  isCurrent 
                    ? 'bg-gradient-to-br from-ratio1-500 via-purple-500 to-ratio1-600' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200'
                }`}>
                  {isCurrent ? (
                    <StarIcon className="h-8 w-8 text-white" />
                  ) : (
                    <ServerIcon className="h-8 w-8 text-gray-600" />
                  )}
                  {isCurrent && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                      <StarIcon className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-2xl font-bold text-gray-900">{machine}</h3>
                    {isCurrent && (
                      <span className="status-badge status-badge-success">
                        Current Node
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{machineFiles.length} files stored</p>
                </div>
              </div>

              {/* Enhanced File Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {machineFiles.map((file) => (
                  <div
                    key={file.cid}
                    className={`group rounded-xl p-6 transition-all duration-300 ${
                      isCurrent 
                        ? 'bg-white/80 backdrop-blur-sm border border-ratio1-200 hover:bg-ratio1-50 hover:shadow-lg hover:scale-105' 
                        : 'bg-gray-50/80 hover:bg-gray-100/80 hover:shadow-md hover:scale-102'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl shadow-sm ${
                        isCurrent ? 'bg-gradient-to-br from-ratio1-100 to-purple-100' : 'bg-white'
                      }`}>
                        <DocumentIcon className={`h-6 w-6 ${
                          isCurrent ? 'text-ratio1-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <button
                        onClick={() => handleDownloadClick(file)}
                        className={`p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                          isCurrent 
                            ? 'text-ratio1-600 hover:text-ratio1-700 hover:bg-ratio1-100' 
                            : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 truncate" title={file.filename}>
                        {file.filename}
                      </h4>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(file.date_uploaded)}</span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-400 font-mono truncate" title={file.cid}>
                          {file.cid}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {/* Enhanced Empty State */}
      {Object.keys(files).length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-ratio1-100 to-purple-100 rounded-full p-8 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <DocumentIcon className="h-12 w-12 text-ratio1-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-600 mb-6">Upload your first file to get started with Ratio1 Drive</p>
          <div className="bg-gradient-to-r from-ratio1-50 to-purple-50 rounded-xl p-4 border border-ratio1-200">
            <p className="text-sm text-gray-700">
              Your files will appear here once uploaded to the decentralized network
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
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
