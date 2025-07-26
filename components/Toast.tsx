'use client';

import { XMarkIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/lib/contexts/ToastContext';

export default function ToastContainer() {
  const { toasts, hideToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center space-x-3 p-4 rounded-xl shadow-lg border max-w-sm animate-in slide-in-from-right-2 duration-300 ${
            toast.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`}
        >
          {toast.type === 'error' ? (
            <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
          ) : (
            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
          )}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => hideToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
} 