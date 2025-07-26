import { NextRequest, NextResponse } from 'next/server';

export interface ApiLogData {
  method: string;
  url: string;
  status: number;
  duration: number;
  userAgent?: string;
  ip?: string;
  requestBody?: any;
  responseBody?: any;
  error?: any;
  timestamp: string;
}

export function logApiRequest(
  request: NextRequest,
  response: NextResponse,
  startTime: number,
  requestBody?: any,
  responseBody?: any,
  error?: any
) {
  const duration = Date.now() - startTime;
  const logData: ApiLogData = {
    method: request.method,
    url: request.url,
    status: response.status,
    duration,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    requestBody,
    responseBody,
    error,
    timestamp: new Date().toISOString()
  };

  if (error) {
    console.error(`[API ERROR] ${request.method} ${request.url}`, logData);
  } else if (response.status >= 400) {
    console.warn(`[API WARNING] ${request.method} ${request.url}`, logData);
  } else {
    console.log(`[API] ${request.method} ${request.url} - ${response.status} (${duration}ms)`, logData);
  }
}

export function createApiLogger() {
  return {
    logRequest: (request: NextRequest, requestBody?: any) => {
      console.log(`[API REQUEST] ${request.method} ${request.url}`, {
        headers: Object.fromEntries(request.headers.entries()),
        body: requestBody,
        timestamp: new Date().toISOString()
      });
    },
    
    logResponse: (request: NextRequest, response: NextResponse, startTime: number, responseBody?: any) => {
      logApiRequest(request, response, startTime, undefined, responseBody);
    },
    
    logError: (request: NextRequest, error: any, startTime: number) => {
      const response = new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
      logApiRequest(request, response, startTime, undefined, undefined, error);
    }
  };
} 