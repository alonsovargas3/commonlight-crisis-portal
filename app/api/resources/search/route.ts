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

    // Parse new bead filters [bp95, q7cl, q58w, o09d]
    const care_phase = searchParams.get('care_phase') as 'immediate_crisis' | 'acute_support' | 'recovery_support' | 'maintenance' | null;
    const gender_specific = searchParams.get('gender_specific') as 'male' | 'female' | null;
    const has_crisis_services = searchParams.get('has_crisis_services') === 'true';
    const urgentAccessOnly = searchParams.get('urgentAccessOnly') === 'true';
    const walk_ins_accepted = searchParams.get('walk_ins_accepted') === 'true';
    const referral_required = searchParams.get('referral_required') === 'true';

    console.log('Search Request:', {
      keywords,
      location: locationAddress,
      care_phase,
      gender_specific,
      has_crisis_services,
      urgentAccessOnly,
      walk_ins_accepted,
      referral_required,
      allParams: Object.fromEntries(searchParams),
    });

    // Mock search results - in production, this would query your database
    // Apply filters to determine which results to return and their tier [bead 0fxp]
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
            ...(care_phase === 'immediate_crisis' ? [{
              category: 'service' as const,
              field: 'care_phase',
              matched_value: 'immediate_crisis',
              confidence: 'verified' as const,
              last_verified_at: new Date().toISOString(),
              explanation: 'Specializes in immediate crisis intervention',
            }] : []),
            ...(walk_ins_accepted ? [{
              category: 'availability' as const,
              field: 'walk_ins_accepted',
              matched_value: true,
              confidence: 'verified' as const,
              last_verified_at: new Date().toISOString(),
              explanation: 'No appointment needed - walk-ins welcome',
            }] : []),
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
          // Tier based on care_phase match [bead 0fxp]
          tier: care_phase === 'immediate_crisis' ? 'primary' : 'secondary',
        },
        {
          id: 'resource-2',
          name: 'Aurora Mental Health Center',
          description: 'Comprehensive mental health services including crisis support, therapy, and psychiatric care. Gender-specific programs available. Accepts referrals from primary care physicians.',
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
            ...(gender_specific ? [{
              category: 'population' as const,
              field: 'gender_specific',
              matched_value: gender_specific,
              confidence: 'verified' as const,
              last_verified_at: new Date().toISOString(),
              explanation: `Offers ${gender_specific}-specific programs`,
            }] : []),
            ...(referral_required ? [{
              category: 'availability' as const,
              field: 'referral_required',
              matched_value: true,
              confidence: 'verified' as const,
              last_verified_at: new Date().toISOString(),
              explanation: 'Accepts referrals from primary care physicians',
            }] : []),
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
          // Tier based on filter matching [bead 0fxp]
          tier: (care_phase === 'recovery_support' || care_phase === 'maintenance') ? 'primary' : 'secondary',
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
            ...(has_crisis_services ? [{
              category: 'service' as const,
              field: 'has_crisis_services',
              matched_value: true,
              confidence: 'verified' as const,
              last_verified_at: new Date().toISOString(),
              explanation: 'Dedicated crisis intervention services available',
            }] : []),
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
          // Tier based on crisis services filter [bead 0fxp]
          tier: has_crisis_services || care_phase === 'immediate_crisis' ? 'primary' : 'secondary',
        },
      ],
      total: 3,
      applied_filters: {
        keywords,
        location: locationAddress ? {
          address: locationAddress,
        } : undefined,
        care_phase: care_phase || undefined,
        gender_specific: gender_specific || undefined,
        has_crisis_services: has_crisis_services || undefined,
        urgentAccessOnly: urgentAccessOnly || undefined,
        walk_ins_accepted: walk_ins_accepted || undefined,
        referral_required: referral_required || undefined,
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
