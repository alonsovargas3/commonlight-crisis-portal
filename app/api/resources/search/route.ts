import { NextRequest, NextResponse } from 'next/server';
import type { SearchResponse } from '@/types/search';

/**
 * GET /api/resources/search
 *
 * Mock resource search endpoint
 *
 * TODO: Replace with actual backend API call or Supabase query
 * This should:
 * 1. Take CanonicalSearchFilters as URL params
 * 2. Query database/backend API
 * 3. Return SearchResponse with results
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from URL params
    const keywords = searchParams.get('keywords') || '';
    const locationAddress = searchParams.get('location.address') || '';

    console.log('Search Request:', {
      keywords,
      location: locationAddress,
      allParams: Object.fromEntries(searchParams),
    });

    // Mock search results - in production, this would query your database
    const mockResults: SearchResponse = {
      items: [
        {
          id: 'resource-1',
          name: 'Crisis Response Center of Denver',
          display_name: 'Crisis Response Center',
          description: '24/7 crisis intervention services for mental health emergencies. Walk-ins welcome, no appointment needed.',
          type: 'facility',
          city: 'Denver',
          state: 'CO',
          latitude: 39.7392,
          longitude: -104.9903,
          phone_numbers: ['303-555-0123', '1-800-CRISIS-1'],
          website: 'https://example.com/crisis-center',
          email: 'info@crisis-center.example',
          match_score: 0.95,
          match_reasons: [
            {
              category: 'service',
              field: 'service_types',
              matched_value: 'crisis_intervention',
              confidence: 'verified',
              last_verified_at: new Date().toISOString(),
              explanation: 'Provides 24/7 crisis intervention services',
            },
            {
              category: 'availability',
              field: 'urgent_access',
              matched_value: true,
              confidence: 'verified',
              last_verified_at: new Date().toISOString(),
              explanation: 'Walk-ins accepted, no appointment needed',
            },
          ],
          unknowns: [],
          provenance: {
            source: 'verified',
            rcs: 0.95,
            last_verified_at: new Date().toISOString(),
            verification_method: 'manual',
            verified_by: 'admin',
          },
          services: [
            {
              id: 'service-1',
              name: 'Crisis Intervention',
              service_type: 'crisis_intervention',
              rcs: 0.95,
            },
            {
              id: 'service-2',
              name: 'Mental Health Assessment',
              service_type: 'mental_health_assessment',
              rcs: 0.90,
            },
          ],
          distance_km: 2.5,
          accessibility_score: 85,
        },
        {
          id: 'resource-2',
          name: 'Aurora Mental Health Center',
          description: 'Comprehensive mental health services including crisis support, therapy, and psychiatric care.',
          type: 'facility',
          city: 'Aurora',
          state: 'CO',
          latitude: 39.7294,
          longitude: -104.8319,
          phone_numbers: ['303-555-0456'],
          website: 'https://example.com/aurora-mh',
          match_score: 0.88,
          match_reasons: [
            {
              category: 'service',
              field: 'service_types',
              matched_value: 'mental_health',
              confidence: 'verified',
              last_verified_at: new Date().toISOString(),
              explanation: 'Offers comprehensive mental health services',
            },
          ],
          unknowns: ['wait_time'],
          provenance: {
            source: 'verified',
            rcs: 0.88,
            last_verified_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            verification_method: 'automated',
          },
          services: [
            {
              id: 'service-3',
              name: 'Therapy',
              service_type: 'therapy',
              rcs: 0.90,
            },
          ],
          distance_km: 8.2,
          accessibility_score: 75,
        },
        {
          id: 'resource-3',
          name: 'Colorado Crisis Services',
          description: '24/7/365 crisis hotline and walk-in center. Free, confidential support for anyone experiencing a mental health or substance use crisis.',
          type: 'organization',
          city: 'Denver',
          state: 'CO',
          latitude: 39.7442,
          longitude: -105.0002,
          phone_numbers: ['1-844-493-TALK', '303-555-0789'],
          website: 'https://example.com/co-crisis',
          match_score: 0.92,
          match_reasons: [
            {
              category: 'service',
              field: 'service_types',
              matched_value: 'crisis_hotline',
              confidence: 'verified',
              explanation: '24/7/365 crisis hotline available',
            },
            {
              category: 'financial',
              field: 'cost',
              matched_value: 0,
              confidence: 'verified',
              explanation: 'Free services, no insurance required',
            },
          ],
          unknowns: [],
          provenance: {
            source: 'verified',
            rcs: 0.92,
            last_verified_at: new Date().toISOString(),
            verification_method: 'manual',
            verified_by: 'admin',
          },
          services: [
            {
              id: 'service-4',
              name: 'Crisis Hotline',
              service_type: 'crisis_hotline',
              rcs: 0.95,
            },
            {
              id: 'service-5',
              name: 'Walk-in Crisis Center',
              service_type: 'walk_in_crisis',
              rcs: 0.92,
            },
          ],
          distance_km: 1.8,
          accessibility_score: 90,
        },
      ],
      total: 3,
      applied_filters: {
        keywords,
        location: locationAddress ? {
          address: locationAddress,
        } : undefined,
      },
      metadata: {
        execution_time_ms: 125,
        from_cache: false,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(mockResults);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
