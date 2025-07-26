import { NextRequest, NextResponse } from 'next/server';
import { ApiClient } from '@/lib/api-client';
import { createApiLogger } from '@/lib/api-logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const logger = createApiLogger();
  
  try {
    // Log incoming request
    logger.logRequest(request);
    
    const data = await ApiClient.getStatus();
    
    // Debug: log the status data to see what fields are available
    console.log('Status API response data:', JSON.stringify(data, null, 2));
    
    const response = NextResponse.json(data);
    
    // Log successful response
    logger.logResponse(request, response, startTime, data);
    
    return response;
  } catch (error) {
    console.error('Error fetching status:', error);
    
    // Log error
    logger.logError(request, error, startTime);
    
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
} 