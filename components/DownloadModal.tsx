'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ArrowDownTrayIcon, DocumentIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
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
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="card p-6 w-full max-w-md relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-ratio1-500 to-purple-500 p-2 rounded-lg">
                <ArrowDownTrayIcon className="h-6 w-6 text-white" />
              </div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Download File
              </Dialog.Title>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* File Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-ratio1-100 p-2 rounded-lg">
                  <DocumentIcon className="h-5 w-5 text-ratio1-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded: {formatDate(file.date_uploaded)}
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-1 truncate" title={file.cid}>
                    CID: {file.cid}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Mode
              </label>
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium capitalize text-ratio1-600">
                  {transferMode}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret (Optional)
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter secret key if required"
                className="input-field"
                disabled={isDownloading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if the file doesn't require a secret
              </p>
            </div>

            {downloadMessage && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                downloadStatus === 'success' 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                {downloadStatus === 'success' ? (
                  <ArrowDownTrayIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm">{downloadMessage}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
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
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
          </div>

          {/* Loading Overlay */}
          {isDownloading && (
            <div className="absolute inset-0 bg-white flex items-center justify-center rounded-lg">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ratio1-500 mx-auto"></div>
                <p className="text-sm text-gray-600">Downloading file...</p>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 