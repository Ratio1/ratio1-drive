'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import DownloadModal from '@/components/DownloadModal';
import { FileMetadata } from '@/lib/types';
import { apiService } from '@/lib/services/api-service';
import { useToast } from '@/lib/contexts/ToastContext';

export default function FilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [file, setFile] = useState<FileMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const { showToast } = useToast();

  const cid = params.cid as string;
  const secret = searchParams.get('secret');

  useEffect(() => {
    const fetchFileInfo = async () => {
      if (!cid) {
        setError('No file ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Try to get file metadata from the files API
        const filesData = await apiService.getFiles();
        
        // Search for the file across all nodes
        let foundFile: FileMetadata | null = null;
        for (const [node, files] of Object.entries(filesData)) {
          const fileInNode = files.find((f: FileMetadata) => f.cid === cid);
          if (fileInNode) {
            foundFile = fileInNode;
            break;
          }
        }

        if (foundFile) {
          setFile(foundFile);
          setShowDownloadModal(true);
        } else {
          // If not found in metadata, create a basic file object
          // This handles cases where the file exists but metadata might not be available
          const basicFile: FileMetadata = {
            cid,
            filename: `file_${cid.substring(0, 8)}`,
            date_uploaded: new Date().toISOString(),
            owner: 'Unknown',
            isEncryptedWithCustomKey: !!secret
          };
          setFile(basicFile);
          setShowDownloadModal(true);
        }
      } catch (err) {
        console.error('Error fetching file info:', err);
        setError('Failed to load file information');
        showToast('Failed to load file information', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileInfo();
  }, [cid, secret, showToast]);

  const handleCloseDownloadModal = () => {
    setShowDownloadModal(false);
    // Redirect to home page after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ratio1-50 via-purple-50 to-ratio1-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ratio1-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading file information...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ratio1-50 via-purple-50 to-ratio1-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">File Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The requested file could not be found or is no longer available.'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ratio1-50 via-purple-50 to-ratio1-100">
      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={handleCloseDownloadModal}
        file={file}
        transferMode="streaming"
      />
    </div>
  );
} 