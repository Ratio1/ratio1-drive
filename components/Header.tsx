'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { CloudIcon, CogIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  transferMode: 'streaming' | 'base64';
  onTransferModeChange: (mode: 'streaming' | 'base64') => void;
  eeId?: string;
}

export default function Header({ transferMode, onTransferModeChange, eeId }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-ratio1-500 to-purple-500 p-3 rounded-lg">
                <CloudIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-ratio1-600 to-purple-600 bg-clip-text text-transparent">
                  Ratio1 Drive
                </h1>
                {eeId && (
                  <p className="text-sm text-gray-500 flex items-center">
                    <CogIcon className="h-4 w-4 mr-1" />
                    EE_ID: {eeId}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Base64</span>
              <Switch
                checked={transferMode === 'streaming'}
                onChange={(checked) => onTransferModeChange(checked ? 'streaming' : 'base64')}
                className={`${
                  transferMode === 'streaming'
                    ? 'bg-gradient-to-r from-ratio1-500 to-purple-500'
                    : 'bg-gray-200'
                }
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ratio1-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    transferMode === 'streaming' ? 'translate-x-6' : 'translate-x-1'
                  }
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="text-sm font-medium text-gray-700">Streaming</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 