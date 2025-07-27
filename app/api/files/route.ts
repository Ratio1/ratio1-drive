import { NextRequest, NextResponse } from 'next/server';
import { cstoreApi } from '@/lib/api-client';
import { config } from '@/lib/config';
import { FilesData } from '@/lib/types';

export async function GET() {
  try {
    // Use cstore API to get all files via /hgetall endpoint
    const data = await cstoreApi.hashGetAllValuesWithQuery(config.HKEY);
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
              date_uploaded: new Date().toISOString(),
              owner: 'Unknown',
              isEncryptedWithCustomKey: false
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
    
    return NextResponse.json(transformedFiles);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
} 