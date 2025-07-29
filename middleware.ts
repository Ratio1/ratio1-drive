import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  console.log(`=============================START=======================================`);
  // Log incoming request
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`, {
    headers: Object.fromEntries(request.headers.entries()),
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    timestamp: new Date().toISOString()
  });

  // Continue with the request
  const response = NextResponse.next();

  // Log response details
  const duration = Date.now() - start;
  console.log(`[${new Date().toISOString()}] Response ${response.status} ${request.url} - ${duration}ms`, {
    status: response.status,
    statusText: response.statusText,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  });
  console.log(`=============================END=======================================`);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
