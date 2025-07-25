import { NextRequest, NextResponse } from 'next/server';
import { ApiClient } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');
    const secret = searchParams.get('secret');
    const mode = searchParams.get('mode') || 'streaming';
    
    if (!cid) {
      return NextResponse.json(
        { error: 'CID is required' },
        { status: 400 }
      );
    }
    
    if (mode === 'streaming') {
      const response = await ApiClient.downloadFileStreaming(cid, secret || undefined);
      
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
      const result = await ApiClient.downloadFileBase64(cid, secret || undefined);
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

// Keep POST for backward compatibility
export async function POST(request: NextRequest) {
  try {
    const { cid, secret, mode } = await request.json();
    
    if (!cid) {
      return NextResponse.json(
        { error: 'CID is required' },
        { status: 400 }
      );
    }
    
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