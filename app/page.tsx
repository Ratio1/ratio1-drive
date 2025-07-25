 'use client';

import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
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
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const CSTORE_API_URL = process.env.NEXT_PUBLIC_CSTORE_API_URL || 'http://localhost:30000';
      const response = await fetch(`${CSTORE_API_URL}/hgetall?hkey=${config.HKEY}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer admin'
        }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ratio1-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        transferMode={transferMode}
        onTransferModeChange={setTransferMode}
        eeId={eeId}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Upload File</span>
          </button>
        </div>

        <FileList
          files={files}
          transferMode={transferMode}
          onRefresh={fetchFiles}
        />

        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          transferMode={transferMode}
          onUploadSuccess={handleUploadSuccess}
        />
      </main>
    </div>
  );
}