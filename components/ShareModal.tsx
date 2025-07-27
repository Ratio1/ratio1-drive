'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  XMarkIcon, 
  ShareIcon, 
  DocumentIcon, 
  SparklesIcon,
  CalendarIcon,
  FingerPrintIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  UserIcon,
  LockClosedIcon,
  LockOpenIcon,
  LinkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { FileMetadata } from '@/lib/types';
import { useToast } from '@/lib/contexts/ToastContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileMetadata;
}

export default function ShareModal({ isOpen, onClose, file }: ShareModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [customSecret, setCustomSecret] = useState('');
  const { showToast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate shareable links
  const generateShareLinks = () => {
    const baseUrl = window.location.origin;
    const fileUrl = `${baseUrl}/file/${file.cid}`;
    
    const links = {
      direct: fileUrl,
      withSecret: customSecret ? `${fileUrl}?secret=${encodeURIComponent(customSecret)}` : null
    };

    return links;
  };

  const links = generateShareLinks();

  // Copy to clipboard function
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
      showToast(`${fieldName === 'direct' ? 'Direct link' : 'Secret link'} copied to clipboard!`, 'success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleClose = () => {
    setCopiedField(null);
    setShowSecret(false);
    setCustomSecret('');
    onClose();
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
                  <ShareIcon className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <SparklesIcon className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <Dialog.Title className="text-2xl font-bold gradient-text">
                  Share File
                </Dialog.Title>
                <p className="text-sm text-gray-600">Share your file with others via secure links</p>
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
                  
                  {/* Owner Information */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
                    <div className="flex items-center space-x-2 mb-1">
                      <UserIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-medium text-gray-700">Owner</span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">{file.owner}</p>
                  </div>

                  {/* Encryption Status */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
                    <div className="flex items-center space-x-2 mb-1">
                      {file.isEncryptedWithCustomKey ? (
                        <LockClosedIcon className="h-4 w-4 text-red-500" />
                      ) : (
                        <LockOpenIcon className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-xs font-medium text-gray-700">Encryption</span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      {file.isEncryptedWithCustomKey ? 'Custom Key Required' : 'Public File'}
                    </p>
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

            {/* Custom Secret Input (for encrypted files) */}
            {file.isEncryptedWithCustomKey && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Custom Secret Key (Optional)
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={customSecret}
                    onChange={(e) => setCustomSecret(e.target.value)}
                    placeholder="Enter custom secret key to include in share link"
                    className="input-field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showSecret ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Include a secret key in the share link for easier access. Leave empty for direct sharing.
                </p>
              </div>
            )}

            {/* Share Links Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <LinkIcon className="h-5 w-5 text-ratio1-600" />
                <span>Share Links</span>
              </h3>

              {/* Direct Link */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Direct Link</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(links.direct, 'direct')}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Copy Direct Link"
                  >
                    {copiedField === 'direct' ? (
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-600 font-mono break-all bg-gray-50 p-2 rounded border">
                  {links.direct}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Anyone with this link can access the file {file.isEncryptedWithCustomKey ? '(requires secret key)' : ''}
                </p>
              </div>

              {/* Secret Link (if custom secret provided) */}
              {customSecret && (
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <LockClosedIcon className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-700">Secret Link</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(links.withSecret!, 'secret')}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Copy Secret Link"
                    >
                      {copiedField === 'secret' ? (
                        <CheckIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 font-mono break-all bg-gray-50 p-2 rounded border">
                    {links.withSecret}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Link includes the secret key for automatic decryption
                  </p>
                </div>
              )}
            </div>

            {/* Share Instructions */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                <ShareIcon className="h-4 w-4 text-blue-600" />
                <span>How to Share</span>
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Copy the direct link to share with anyone</li>
                {file.isEncryptedWithCustomKey && (
                  <li>• For encrypted files, recipients need the secret key</li>
                )}
                <li>• Add a custom secret to create a pre-authenticated link</li>
                <li>• Links work across all devices and browsers</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={handleClose}
              className="btn-secondary"
            >
              Close
            </button>
            <button
              onClick={() => copyToClipboard(links.direct, 'direct')}
              className="btn-primary flex items-center space-x-2"
            >
              <ShareIcon className="h-5 w-5" />
              <span>Copy Link</span>
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 