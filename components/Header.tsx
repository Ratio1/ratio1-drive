'use client';

import { Switch } from '@headlessui/react';
import { CloudIcon, CogIcon, CurrencyDollarIcon, SparklesIcon, UserIcon } from '@heroicons/react/24/outline';
import { useStatus } from '@/lib/contexts/StatusContext';
import { useToast } from '@/lib/contexts/ToastContext';

interface HeaderProps {
  transferMode: 'streaming' | 'base64';
  onTransferModeChange: (mode: 'streaming' | 'base64') => void;
  eeId?: string;
  username?: string | null;
}

export default function Header({ transferMode, onTransferModeChange, eeId, username }: HeaderProps) {
  const { status } = useStatus();
  const { showToast } = useToast();
  
  // Extract ETH address from status data
  const getEthAddress = () => {
    // The ETH address is stored in ee_node_eth_address property
    return status?.ee_node_eth_address || null;
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
                  {eeId && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <CogIcon className="h-4 w-4 mr-1" />
                      EE_ID: <span className="font-mono ml-1">{eeId}</span>
                    </p>
                  )}
                  {ethAddress && (
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">ETH:</span>
                      <span className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                        {ethAddress.substring(0, 8)}...{ethAddress.substring(ethAddress.length - 6)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Mode Toggle Section */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
              <span className={`text-sm font-medium transition-colors duration-200 ${
                transferMode === 'base64' ? 'text-gray-900' : 'text-gray-500'
              }`}>
                Base64
              </span>
              <Switch
                checked={transferMode === 'streaming'}
                onChange={(checked) => onTransferModeChange(checked ? 'streaming' : 'base64')}
                className={`${
                  transferMode === 'streaming'
                    ? 'bg-gradient-to-r from-ratio1-500 to-purple-500'
                    : 'bg-gray-300'
                }
                relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ratio1-500 focus:ring-offset-2 shadow-inner`}
              >
                <span
                  className={`${
                    transferMode === 'streaming' ? 'translate-x-7' : 'translate-x-1'
                  }
                  inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg`}
                />
              </Switch>
              <span className={`text-sm font-medium transition-colors duration-200 ${
                transferMode === 'streaming' ? 'text-gray-900' : 'text-gray-500'
              }`}>
                Streaming
              </span>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                status ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm text-gray-600">
                {status ? 'Connected' : 'Disconnected'}
              </span>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
} 