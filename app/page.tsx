 'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import FileList from '@/components/FileList';
import UploadModal from '@/components/UploadModal';
import { FilesData, TransferMode } from '@/lib/types';
import { config } from '@/lib/config';
import { useEeId } from '@/lib/contexts/StatusContext';

export default function Home() {
  const [files, setFiles] = useState<FilesData>({});
  const [transferMode, setTransferMode] = useState<TransferMode>('streaming');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const eeId = useEeId();

  useEffect(() => {
    // Only fetch files in the browser, not during build
    if (typeof window !== 'undefined') {
      fetchFiles();
    } else {
      // During build, just set loading to false
      setIsLoading(false);
    }
  }, []);

  const fetchFiles = async () => {
    try {
      const CSTORE_API_URL = process.env.NEXT_PUBLIC_CSTORE_API_URL || 'http://localhost:30000';
      const response = await fetch(`${CSTORE_API_URL}/hgetall?hkey=${config.HKEY}`, {
        method: 'GET',
      });
      if (response.ok) {
        const data = await response.json();
        const result = data.result || {};
        
        // Transform the response: parse stringified JSON arrays and convert to FileMetadata
        const transformedFiles: FilesData = {};
        Object.entries(result).forEach(([machine, stringifiedArray]) => {
          try {
            const parsed = JSON.parse(stringifiedArray as string);
            // Handle both old format (string array) and new format (metadata array)
            if (Array.isArray(parsed)) {
              if (typeof parsed[0] === 'string') {
                // Old format - convert to new format
                transformedFiles[machine] = parsed.map((cid: string) => ({
                  cid,
                  filename: `file_${cid.substring(0, 8)}`,
                  date_uploaded: new Date().toISOString()
                }));
              } else {
                // New format - already metadata objects
                transformedFiles[machine] = parsed;
              }
            } else {
              transformedFiles[machine] = [];
            }
          } catch (parseError) {
            console.error(`Error parsing data for machine ${machine}:`, parseError);
            transformedFiles[machine] = [];
          }
        });
        
        setFiles(transformedFiles);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchFiles();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ratio1-50 via-purple-50 to-ratio1-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-ratio1-200 border-t-ratio1-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading Ratio1 Drive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ratio1-50 via-purple-50 to-ratio1-100">
      <Header
        transferMode={transferMode}
        onTransferModeChange={setTransferMode}
        eeId={eeId}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Upload Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary flex items-center space-x-3 text-lg px-8 py-4"
              >
                <div className="relative">
                  <PlusIcon className="h-6 w-6" />
                  <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                    <SparklesIcon className="h-2 w-2 text-white" />
                  </div>
                </div>
                <span>Upload File</span>
              </button>
              <div className="hidden sm:block">
                <p className="text-gray-600 text-sm">
                  Store your files securely on the decentralized network
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                <div className="text-2xl font-bold gradient-text">
                  {Object.keys(files).length}
                </div>
                <div className="text-sm text-gray-600">Active Nodes</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                <div className="text-2xl font-bold gradient-text">
                  {Object.values(files).reduce((total, machineFiles) => total + machineFiles.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Files</div>
              </div>
            </div>
          </div>
        </div>

        {/* File List with enhanced spacing */}
        <div className="space-y-8">
          <FileList
            files={files}
            transferMode={transferMode}
            onRefresh={fetchFiles}
          />
        </div>

        {/* Upload Modal */}
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          transferMode={transferMode}
          onUploadSuccess={handleUploadSuccess}
        />
      </main>

      {/* Enhanced Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-ratio1-500 to-purple-500 p-2 rounded-lg">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold gradient-text">Ratio1 Drive</span>
            </div>
            <p className="text-gray-600 text-sm">
              Decentralized file storage powered by blockchain technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}