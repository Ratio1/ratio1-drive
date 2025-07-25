import { NextRequest, NextResponse } from 'next/server';
import { cstoreApi } from '@/lib/api-client';
import { config } from '@/lib/config';

export async function GET() {
  try {
    // Use cstore API to get all files via /hgetall endpoint with token and hkey as query parameters
    const data = await cstoreApi.hashGetAllValuesWithQuery(config.HKEY);
    console.log(data);
    // Return the files data from the hkey
    return NextResponse.json(data[config.HKEY] || {});
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
} 