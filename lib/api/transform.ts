/**
 * Type Transformation Layer
 *
 * Handles field mapping between frontend and backend schemas.
 * - Frontend uses CanonicalSearchFilters from types/search.ts
 * - Backend uses different field names and structures
 */

import type { CanonicalSearchFilters, SearchResponse, ResourceSearchResult, LocationCoordinate } from '@/types/search';

/**
 * Transform frontend CanonicalSearchFilters to backend query params
 */
export function transformFiltersToBackendParams(
  filters: CanonicalSearchFilters
): Record<string, string> {
  const params: Record<string, string> = {};

  // Text search: keywords → query
  if (filters.keywords) {
    params.query = filters.keywords;
  }

  // Location: SearchLocation → "lat,lon"
  if (filters.location?.coordinates) {
    const lat = filters.location.coordinates.lat;
    const lon = filters.location.coordinates.lon;

    if (typeof lat === 'number' && typeof lon === 'number') {
      params.location = `${lat},${lon}`;
    } else {
      console.error('[Transform] Invalid coordinates:', { lat, lon, type_lat: typeof lat, type_lon: typeof lon });
      throw new Error(`Invalid location coordinates: lat=${lat} (${typeof lat}), lon=${lon} (${typeof lon})`);
    }
  }

  // Distance: max_distance_km → radius_km
  if (filters.max_distance_km) {
    params.radius_km = filters.max_distance_km.toString();
  }

  // Service types (comma-separated)
  if (filters.service_types?.length) {
    params.service_types = filters.service_types.join(',');
  }

  // Insurance: insurance → insurance_types
  if (filters.insurance?.length) {
    params.insurance_types = filters.insurance.join(',');
  }

  // Languages (comma-separated)
  if (filters.languages?.length) {
    params.languages = filters.languages.join(',');
  }

  // Age groups (comma-separated)
  if (filters.age_groups?.length) {
    params.age_groups = filters.age_groups.join(',');
  }

  // Boolean filters
  if (filters.has_crisis_services !== undefined) {
    params.has_crisis_services = filters.has_crisis_services.toString();
  }
  if (filters.walk_ins_accepted !== undefined) {
    params.walk_ins_accepted = filters.walk_ins_accepted.toString();
  }
  if (filters.referral_required !== undefined) {
    params.referral_required = filters.referral_required.toString();
  }
  if (filters.gender_specific) {
    params.gender_specific = filters.gender_specific;
  }
  if (filters.lgbtq_affirming !== undefined) {
    params.lgbtq_affirming = filters.lgbtq_affirming.toString();
  }
  if (filters.wheelchair_accessible !== undefined) {
    params.wheelchair_accessible = filters.wheelchair_accessible.toString();
  }
  if (filters.telehealth_available !== undefined) {
    params.telehealth_available = filters.telehealth_available.toString();
  }

  // Availability: camelCase → snake_case
  if (filters.urgentAccessOnly !== undefined) {
    params.urgent_access_only = filters.urgentAccessOnly.toString();
  }
  if (filters.acceptingNewPatients !== undefined) {
    params.accepting_new_patients = filters.acceptingNewPatients.toString();
  }

  // Care phase
  if (filters.care_phase) {
    params.care_phase = filters.care_phase;
  }

  // Quality filters
  if (filters.verified_only !== undefined) {
    params.verified_only = filters.verified_only.toString();
  }
  if (filters.min_rcs !== undefined) {
    params.min_confidence = filters.min_rcs.toString();
  }

  // Pagination
  if (filters.limit) {
    params.limit = filters.limit.toString();
  }
  if (filters.offset) {
    params.offset = filters.offset.toString();
  }

  return params;
}

/**
 * Transform backend SearchResponseV2 to frontend SearchResponse
 */
export function transformBackendSearchResponse(
  backendResponse: any
): SearchResponse {
  return {
    items: backendResponse.results?.map(transformBackendResult) || [],
    total: backendResponse.total || 0,
    applied_filters: transformBackendFilters(backendResponse.filters_applied || {}),
    metadata: {
      execution_time_ms: backendResponse.execution_time_ms || 0,
      from_cache: backendResponse.from_cache || false,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Transform individual backend result to frontend ResourceSearchResult
 */
function transformBackendResult(result: any): ResourceSearchResult {
  return {
    id: result.resource_id,
    name: result.details?.name || result.name || 'Unknown Resource',
    display_name: result.details?.display_name || result.display_name,
    description: result.details?.description || result.description,
    type: result.resource_type || result.type || 'facility',
    city: result.details?.city || result.city,
    state: result.details?.state || result.state,
    latitude: result.details?.latitude || result.latitude,
    longitude: result.details?.longitude || result.longitude,
    phone_numbers: result.details?.phone_numbers || result.phone_numbers || [],
    website: result.details?.website || result.website,
    email: result.details?.email || result.email,
    match_score: result.match?.score || result.match_score || 0.5,
    match_reasons: (result.match?.criteria_met || []).map((criterion: string) => ({
      category: 'service' as const,
      field: criterion,
      matched_value: true,
      confidence: 'verified' as const,
      explanation: `Matched ${criterion}`,
    })),
    unknowns: [],
    provenance: {
      source: result.verification?.verification_method || result.provenance?.source || 'unknown',
      rcs: result.verification?.confidence_score || result.provenance?.rcs || 0.5,
      last_verified_at: result.verification?.last_verified_at || result.provenance?.last_verified_at,
      verification_method: result.verification?.verification_method as 'automated' | 'manual' | 'community' | undefined,
      verified_by: result.verification?.verified_by || result.provenance?.verified_by,
    },
    services: result.details?.services?.map((svc: any) => ({
      id: svc.id || svc.name,
      name: svc.name,
      service_type: svc.canonical_type || svc.service_type,
      rcs: svc.rcs || result.verification?.confidence_score || 0.5,
    })) || [],
    distance_km: result.details?.distance_km || result.distance_km,
    accessibility_score: result.verification?.data_completeness
      ? Math.round(result.verification.data_completeness * 100)
      : result.accessibility_score,
    tier: result.tier,
  };
}

/**
 * Transform backend filters back to frontend format
 */
function transformBackendFilters(backendFilters: any): CanonicalSearchFilters {
  return {
    keywords: backendFilters.query,
    location: backendFilters.location ? {
      address: backendFilters.location,
      coordinates: parseLocation(backendFilters.location),
    } : undefined,
    max_distance_km: backendFilters.radius_km ? Number(backendFilters.radius_km) : undefined,
    service_types: backendFilters.service_types?.map((st: any) =>
      typeof st === 'string' ? st : st.code
    ),
    insurance: backendFilters.insurance_types?.map((it: any) =>
      typeof it === 'string' ? it : it.code
    ),
    languages: backendFilters.languages?.map((lang: any) =>
      typeof lang === 'string' ? lang : lang.code
    ),
    age_groups: backendFilters.age_groups,
    has_crisis_services: backendFilters.has_crisis_services,
    walk_ins_accepted: backendFilters.walk_ins_accepted,
    referral_required: backendFilters.referral_required,
    gender_specific: backendFilters.gender_specific,
    lgbtq_affirming: backendFilters.lgbtq_affirming,
    wheelchair_accessible: backendFilters.wheelchair_accessible,
    telehealth_available: backendFilters.telehealth_available,
    urgentAccessOnly: backendFilters.urgent_access_only,
    acceptingNewPatients: backendFilters.accepting_new_patients,
    care_phase: backendFilters.care_phase,
    verified_only: backendFilters.verified_only,
    min_rcs: backendFilters.min_confidence ? Number(backendFilters.min_confidence) : undefined,
    limit: backendFilters.limit ? Number(backendFilters.limit) : undefined,
    offset: backendFilters.offset ? Number(backendFilters.offset) : undefined,
  };
}

/**
 * Parse "lat,lon" string to LocationCoordinate
 */
function parseLocation(locationString: string): LocationCoordinate | undefined {
  if (!locationString) return undefined;
  const [lat, lon] = locationString.split(',').map(Number);
  return lat && lon ? { lat, lon } : undefined;
}
