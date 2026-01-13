import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Railway and other monitoring services
 * This endpoint is public (no authentication required)
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'commonlight-crisis-portal',
    },
    { status: 200 }
  );
}
