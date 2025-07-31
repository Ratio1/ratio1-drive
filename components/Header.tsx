'use client';

import { Switch } from '@headlessui/react';
import { CloudIcon, CogIcon, CurrencyDollarIcon, SparklesIcon, UserIcon } from '@heroicons/react/24/outline';
import { useStatus } from '@/lib/contexts/StatusContext';
import { useToast } from '@/lib/contexts/ToastContext';
import DualStatusWidget from './DualStatusWidget';

interface HeaderProps {
  transferMode: 'streaming' | 'base64';
  onTransferModeChange: (mode: 'streaming' | 'base64') => void;
  eeId?: string;
  username?: string | null;
}

export default function Header({ transferMode, onTransferModeChange, eeId, username }: HeaderProps) {
  const { r1fsStatus, cstoreStatus } = useStatus();
  const { showToast } = useToast();

  // Extract ETH address from status data
  const getEthAddress = () => {
    // The ETH address is stored in ee_node_eth_address property
    return r1fsStatus?.ee_node_eth_address || cstoreStatus?.ee_node_eth_address || null;
  };

  const ethAddress = getEthAddress();

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo and Title Section */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-ratio1-500 via-purple-500 to-ratio1-600 p-4 rounded-2xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <CloudIcon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                  <SparklesIcon className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">
                  Ratio1 Drive
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  {username && (
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">User:</span>
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {username}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Mode Toggle Section - Disabled */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 bg-gray-100/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 opacity-50 cursor-not-allowed">
              <span className="text-sm font-medium text-gray-400">
                Base64
              </span>
              <Switch
                checked={true}
                onChange={() => {}} // Disabled - no action
                disabled={true}
                className="bg-gray-300 relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 shadow-inner cursor-not-allowed"
              >
                <span
                  className="inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg translate-x-7"
                />
              </Switch>
              <span className="text-sm font-medium text-gray-400">
                Streaming
              </span>
            </div>

            {/* Dual Status Widget */}
            <DualStatusWidget />

          </div>
        </div>
      </div>
    </header>
  );
}
