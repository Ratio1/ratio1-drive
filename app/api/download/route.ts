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

      // Forward the response directly without buffering
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
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

      // Forward the response directly without buffering
      // This enables true streaming from r1fs to the client
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
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
