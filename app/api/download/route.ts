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
      
      // Extract filename from x-meta header
      let filename = cid;
      const xMetaHeader = response.headers.get('x-meta');
      if (xMetaHeader) {
        try {
          const metaData = JSON.parse(xMetaHeader);
          if (metaData.meta && metaData.meta.filename) {
            filename = metaData.meta.filename;
          }
        } catch (parseError) {
          console.warn('Failed to parse x-meta header:', parseError);
          // Fallback to filename header if x-meta parsing fails
          filename = response.headers.get('filename') || 'download';
        }
      } else {
        // Fallback to filename header if x-meta is not present
        filename = response.headers.get('filename') || 'download';
      }
      
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
      
      // Extract filename from x-meta header
      let filename = 'download';
      const xMetaHeader = response.headers.get('x-meta');
      if (xMetaHeader) {
        try {
          const metaData = JSON.parse(xMetaHeader);
          if (metaData.meta && metaData.meta.filename) {
            filename = metaData.meta.filename;
          }
        } catch (parseError) {
          console.warn('Failed to parse x-meta header:', parseError);
          // Fallback to filename header if x-meta parsing fails
          filename = response.headers.get('filename') || 'download';
        }
      } else {
        // Fallback to filename header if x-meta is not present
        filename = response.headers.get('filename') || 'download';
      }
      
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