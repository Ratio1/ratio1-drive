import { NextResponse } from 'next/server';
import { ApiClient } from '@/lib/api-client';

export async function GET() {
  try {
    const data = await ApiClient.getStatus();
    
    // Debug: log the status data to see what fields are available
    console.log('Status API response data:', JSON.stringify(data, null, 2));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
} 