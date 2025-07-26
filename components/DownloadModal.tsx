'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  XMarkIcon, 
  ArrowDownTrayIcon, 
  DocumentIcon, 
  ExclamationCircleIcon,
  SparklesIcon,
  CloudArrowDownIcon,
  CalendarIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';
import { FileMetadata } from '@/lib/types';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileMetadata;
  transferMode: 'streaming' | 'base64';
}

export default function DownloadModal({ isOpen, onClose, file, transferMode }: DownloadModalProps) {
  const [secret, setSecret] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [downloadMessage, setDownloadMessage] = useState('');

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadStatus('idle');
    setDownloadMessage('');

    try {
      if (transferMode === 'streaming') {
        // For streaming mode, use GET request with query parameters
        const params = new URLSearchParams({
          cid: file.cid,
          mode: 'streaming',
        });
        if (secret) {
          params.append('secret', secret);
        }

        const response = await fetch(`/api/download?${params.toString()}`, {
          method: 'GET',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Download failed');
        }

        // Create a blob from the response and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setDownloadStatus('success');
        setDownloadMessage('File downloaded successfully!');
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        // For base64 mode, get the file data and trigger download
        const response = await fetch('/api/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cid: file.cid,
            secret: secret || undefined,
            mode: 'base64',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Download failed');
        }

        const result = await response.json();
        
        // Convert base64 to blob and trigger download
        const binaryString = atob(result.file_base64_str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename || file.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setDownloadStatus('success');
        setDownloadMessage('File downloaded successfully!');
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      setDownloadStatus('error');
      setDownloadMessage(error instanceof Error ? error.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    setSecret('');
    setDownloadStatus('idle');
    setDownloadMessage('');
    setIsDownloading(false);
    onClose();
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

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="card-glass p-8 w-full max-w-lg relative transform transition-all">
          {/* Enhanced Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-ratio1-500 via-purple-500 to-ratio1-600 p-3 rounded-xl shadow-lg">
                  <CloudArrowDownIcon className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <SparklesIcon className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <Dialog.Title className="text-2xl font-bold gradient-text">
                  Download File
                </Dialog.Title>
                <p className="text-sm text-gray-600">Retrieve your file from the decentralized network</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Enhanced File Information */}
            <div className="bg-gradient-to-r from-ratio1-50 to-purple-50 rounded-xl p-6 border border-ratio1-200">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-ratio1-100 to-purple-100 p-3 rounded-xl shadow-sm">
                  <DocumentIcon className="h-6 w-6 text-ratio1-600" />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 truncate" title={file.filename}>
                      {file.filename}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Uploaded: {formatDate(file.date_uploaded)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
                    <div className="flex items-center space-x-2 mb-1">
                      <FingerPrintIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">Content ID</span>
                    </div>
                    <p className="text-xs text-gray-600 font-mono truncate" title={file.cid}>
                      {file.cid}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer Mode Display */}
            <div className="bg-gradient-to-r from-ratio1-50 to-purple-50 rounded-xl p-4 border border-ratio1-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Transfer Mode</span>
                <span className="status-badge status-badge-info capitalize">
                  {transferMode}
                </span>
              </div>
            </div>

            {/* Secret Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Secret Key (Optional)
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter secret key if required"
                className="input-field"
                disabled={isDownloading}
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter the secret key if this file was encrypted during upload
              </p>
            </div>

            {/* Status Messages */}
            {downloadMessage && (
              <div className={`flex items-center space-x-3 p-4 rounded-xl border ${
                downloadStatus === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {downloadStatus === 'success' ? (
                  <ArrowDownTrayIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{downloadMessage}</span>
              </div>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={handleClose}
              className="btn-secondary"
              disabled={isDownloading}
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isDownloading ? (
                <>
                  <ArrowDownTrayIcon className="h-5 w-5 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <CloudArrowDownIcon className="h-5 w-5" />
                  <span>Download File</span>
                </>
              )}
            </button>
          </div>

          {/* Enhanced Loading Overlay */}
          {isDownloading && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl space-y-6 p-8 shadow-2xl">
              {/* Animated Download Icon */}
              <div className="relative">
                <div className="bg-gradient-to-br from-ratio1-500 to-purple-500 rounded-full p-6 animate-pulse">
                  <CloudArrowDownIcon className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 animate-bounce">
                  <SparklesIcon className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Download Progress */}
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Downloading File</h3>
                <p className="text-sm text-gray-600">Retrieving from decentralized storage</p>
                
                {/* Animated Progress Bar */}
                <div className="w-64 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-ratio1-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 