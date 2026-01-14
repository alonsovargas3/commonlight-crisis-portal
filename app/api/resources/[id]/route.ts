import { NextRequest, NextResponse } from 'next/server';
import { BackendClient, BackendAPIError } from '@/lib/api/backend-client';

/**
 * GET /api/resources/[id]
 *
 * Get detailed information for a specific resource by ID.
 * Proxies to backend /v2/resources/{id} endpoint.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('[Resource Detail] Request for ID:', id);

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid resource ID format (expected UUID)' },
        { status: 400 }
      );
    }

    // Call backend API
    try {
      const resource = await BackendClient.getResourceById(id);

      console.log('[Resource Detail] Success:', { id, name: resource.name || resource.details?.name });

      return NextResponse.json(resource);

    } catch (backendError) {
      console.error('[Resource Detail] Backend error:', backendError);

      if (backendError instanceof BackendAPIError) {
        if (backendError.statusCode === 404) {
          return NextResponse.json(
            { error: 'Resource not found' },
            { status: 404 }
          );
        }

        return NextResponse.json(
          {
            error: 'Failed to fetch resource',
            details: backendError.message,
          },
          { status: backendError.statusCode || 500 }
        );
      }

      throw backendError;
    }

  } catch (error) {
    console.error('[Resource Detail] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch resource details',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
