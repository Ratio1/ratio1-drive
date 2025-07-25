import { NextRequest, NextResponse } from 'next/server';
import { ApiClient } from '@/lib/api-client';

export async function POST(request: NextRequest) {
  try {
    const { cid, secret, mode } = await request.json();
    
    if (mode === 'streaming') {
      const response = await ApiClient.downloadFileStreaming(cid, secret);
      
      // Get the file data and filename from headers or response
      const fileData = await response.arrayBuffer();
      const filename = response.headers.get('filename') || 'download';
      
      return new NextResponse(fileData, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'filename': filename,
        },
      });
    } else {
      const result = await ApiClient.downloadFileBase64(cid, secret);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}