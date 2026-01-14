import { NextRequest, NextResponse } from 'next/server';
import type { SearchResponse, CanonicalSearchFilters } from '@/types/search';
import { BackendClient, BackendAPIError } from '@/lib/api/backend-client';
import {
  transformFiltersToBackendParams,
  transformBackendSearchResponse
} from '@/lib/api/transform';
import { FilterUtils } from '@/types/search';

/**
 * GET /api/resources/search
 *
 * Search resources using backend /v2/resources/search endpoint.
 * Transforms frontend filter schema to backend API format and back.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    console.log('[Resource Search] Request params:', Object.fromEntries(searchParams));

    // Parse filters from URL params using existing utility
    const filters: CanonicalSearchFilters = FilterUtils.fromURLParams(searchParams);

    console.log('[Resource Search] Parsed filters:', JSON.stringify(filters, null, 2));

    // Validate required fields - location OR keywords must be provided
    if (!filters.location && !filters.keywords) {
      return NextResponse.json(
        { error: 'Either location or keywords is required for search' },
        { status: 400 }
      );
    }

    // Transform to backend format
    let backendParams;
    try {
      backendParams = transformFiltersToBackendParams(filters);
      console.log('[Resource Search] Backend params:', backendParams);

      // CRITICAL: Backend requires at least 'query' OR 'service_types'
      // If neither exists, add a default based on care_phase or use generic crisis search
      if (!backendParams.query && !backendParams.service_types) {
        console.warn('[Resource Search] No query or service_types - adding default');

        // If care_phase is immediate_crisis, default to crisis services
        if (backendParams.care_phase === 'immediate_crisis') {
          backendParams.service_types = 'crisis_line,crisis_text,crisis_chat,crisis_mobile,crisis_walk_in,suicide_prevention';
          console.log('[Resource Search] Added default crisis service types for immediate_crisis');
        } else {
          // Otherwise, add generic query
          backendParams.query = 'mental health support';
          console.log('[Resource Search] Added default query');
        }
      }

    } catch (transformError) {
      console.error('[Resource Search] Transform error:', transformError);
      return NextResponse.json(
        {
          error: 'Failed to transform filters',
          details: transformError instanceof Error ? transformError.message : String(transformError),
          filters: filters
        },
        { status: 500 }
      );
    }

    // Call backend API
    try {
      const backendResponse = await BackendClient.searchResources(backendParams);

      console.log('[Resource Search] Backend response:', {
        total: backendResponse.total,
        results: backendResponse.results?.length || 0,
      });

      // Transform backend response to frontend format
      const frontendResponse: SearchResponse = transformBackendSearchResponse(backendResponse);

      return NextResponse.json(frontendResponse);

    } catch (backendError) {
      console.error('[Resource Search] Backend error:', backendError);

      if (backendError instanceof BackendAPIError) {
        return NextResponse.json(
          {
            error: 'Backend search failed',
            details: backendError.message,
            statusCode: backendError.statusCode,
          },
          { status: backendError.statusCode || 500 }
        );
      }

      throw backendError;
    }

  } catch (error) {
    console.error('[Resource Search] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
