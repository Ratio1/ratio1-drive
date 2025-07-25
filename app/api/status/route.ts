import { NextRequest, NextResponse } from 'next/server';
import { ApiClient } from '@/lib/api-client';

export async function GET() {
  try {
    const data = await ApiClient.getStatus();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
} 