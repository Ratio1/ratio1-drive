'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  XMarkIcon, 
  UserIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsernameSet: (username: string) => void;
}

export default function UsernameModal({ isOpen, onClose, onUsernameSet }: UsernameModalProps) {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }

    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters long');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate a brief delay for better UX
    setTimeout(() => {
      onUsernameSet(username.trim());
      setIsSubmitting(false);
      setUsername('');
    }, 500);
  };

  const handleClose = () => {
    setUsername('');
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="card-glass p-8 w-full max-w-md relative transform transition-all">
          {/* Enhanced Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-ratio1-500 via-purple-500 to-ratio1-600 p-3 rounded-xl shadow-lg">
                  <UserIcon className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <SparklesIcon className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <Dialog.Title className="text-2xl font-bold gradient-text">
                  Welcome to Ratio1 Drive
                </Dialog.Title>
                <p className="text-sm text-gray-600">Please enter your username to continue</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="input-field"
                autoFocus
                disabled={isSubmitting}
                minLength={2}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                This will be used to identify you as the owner of uploaded files
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-3 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800">
                <CheckCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-gradient-to-r from-ratio1-50 to-purple-50 rounded-xl p-4 border border-ratio1-200">
              <div className="flex items-start space-x-3">
                <UserIcon className="h-5 w-5 text-ratio1-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Why do we need your username?</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Identifies you as the owner of uploaded files</li>
                    <li>• Helps track file ownership across the network</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!username.trim() || isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="relative h-6 w-6">
                      {/* Purple track */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500 rounded-full transform -rotate-12"></div>
                      {/* Rolling circle */}
                      <div className="absolute bottom-1 left-0 w-4 h-4 border-2 border-white rounded-full animate-bounce"></div>
                    </div>
                    <span>Setting up...</span>
                  </>
                ) : (
                  <>
                    <UserIcon className="h-5 w-5" />
                    <span>Continue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 