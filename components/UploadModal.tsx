'use client';

import { useState, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, DocumentArrowUpIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferMode: 'streaming' | 'base64';
  onUploadSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, transferMode, onUploadSuccess }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [secret, setSecret] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState<'idle' | 'uploading' | 'chainstore' | 'completed'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadStep('uploading');

    try {
      if (transferMode === 'streaming') {
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (selectedFile.name) formData.append('filename', selectedFile.name);
        if (secret) formData.append('secret', secret);

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/upload');

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(progress);
            }
          };

          xhr.onload = () => {
            setUploadStep('chainstore');
            try {
              const result = JSON.parse(xhr.responseText);
              if (xhr.status >= 200 && xhr.status < 300) {
                setUploadStatus('success');
                setUploadMessage('File uploaded successfully!');
                setUploadStep('completed');
                setTimeout(() => {
                  onUploadSuccess();
                  handleClose();
                }, 2000);
                resolve();
              } else {
                reject(new Error(result.error || 'Upload failed'));
              }
            } catch {
              reject(new Error('Upload failed'));
            }
          };

          xhr.onerror = () => {
            reject(new Error('Upload failed'));
          };

          xhr.send(formData);
        });
      } else {
        // Base64 mode
        const reader = new FileReader();
        const fileBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:type;base64, prefix
          };
          reader.readAsDataURL(selectedFile);
        });

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_base64_str: fileBase64,
            filename: selectedFile.name,
            secret: secret || undefined,
          }),
        });

        setUploadProgress(100);

        const result = await response.json();
        setUploadStep('chainstore');

        if (response.ok) {
          setUploadStatus('success');
          setUploadMessage('File uploaded successfully!');
          setUploadStep('completed');
          setTimeout(() => {
            onUploadSuccess();
            handleClose();
          }, 2000);
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      }

    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setSecret('');
    setUploadStatus('idle');
    setUploadMessage('');
    setIsUploading(false);
    onClose();
    setUploadStep('idle');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="card p-6 w-full max-w-md relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-ratio1-500 to-purple-500 p-2 rounded-lg">
                <DocumentArrowUpIcon className="h-6 w-6 text-white" />
              </div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Upload File
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
                Select File
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-ratio1-400 rounded-lg p-6 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="space-y-2">
                    <DocumentArrowUpIcon className="h-8 w-8 text-ratio1-500 mx-auto" />
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <DocumentArrowUpIcon className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">Click to select a file</p>
                  </div>
                )}
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
                placeholder="Enter secret key"
                className="input-field"
              />
            </div>

            {uploadMessage && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                uploadStatus === 'success' 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                {uploadStatus === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm">{uploadMessage}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleClose}
              className="btn-secondary"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {/* Loader Overlay with detailed steps */}
          {isUploading && (
            <div className="absolute inset-0 bg-white flex flex-col items-center justify-center rounded-lg space-y-6 p-6 shadow-lg">
              {/* Progress bar for file upload */}
              <div className="w-full max-w-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Uploading File</span>
                  <span className="text-xs text-gray-700">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div
                    className="bg-ratio1-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>

              {/* Steps list */}
              <ul className="space-y-3 w-full max-w-xs">
                {[
                  { label: 'Uploading File', key: 'uploading' },
                  { label: 'Storing to Chainstore', key: 'chainstore' },
                  { label: 'Completed', key: 'completed' },
                ].map((step, idx) => {
                  const stepIndexMap: Record<string, number> = {
                    uploading: 0,
                    chainstore: 1,
                    completed: 2,
                  };
                  const currentIndex = stepIndexMap[uploadStep];
                  const status = idx < currentIndex
                    ? 'done'
                    : idx === currentIndex
                      ? 'current'
                      : 'pending';
                  return (
                    <li key={step.key} className="flex items-center space-x-2">
                      {status === 'done' && (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      )}
                      {status === 'current' && (
                        <ArrowPathIcon className="h-5 w-5 text-ratio1-500 animate-spin" />
                      )}
                      {status === 'pending' && (
                        <div className="h-3 w-3 rounded-full bg-gray-300" />
                      )}
                      <span
                        className={`text-sm ${status === 'done'
                            ? 'text-green-700'
                            : status === 'current'
                              ? 'text-ratio1-700'
                              : 'text-gray-500'}`}
                      >
                        {step.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 