import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Handle API requests to proxy them to the backend
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const backendUrl = `http://localhost:2056${request.nextUrl.pathname}${request.nextUrl.search}`;
    
    try {
      // Create a new request to the backend
      const response = await fetch(backendUrl, {
        method: request.method,
        headers: {
          'Content-Type': request.headers.get('content-type') || 'application/json',
          'Cookie': request.headers.get('cookie') || '',
          // Forward other headers as needed
        },
        body: request.body,
        // @ts-expect-error - duplex option is needed for streaming
        duplex: 'half',
      });

      // Create a new response with the backend response
      const responseData = await response.text();
      
      const nextResponse = new NextResponse(responseData, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'application/json',
          // Forward other headers as needed
        },
      });

      return nextResponse;
    } catch (error) {
      console.error('Proxy error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
