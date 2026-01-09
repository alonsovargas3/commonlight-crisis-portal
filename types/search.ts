/**
 * Canonical Search Filter Types
 *
 * This schema is the single source of truth for both classic search UI
 * and LLM-extracted filters. It ensures parity between the two modes.
 */

export interface LocationCoordinate {
  lat: number;
  lon: number;
}

export interface SearchLocation {
  address: string;
  coordinates?: LocationCoordinate;
  city?: string;
  state?: string;
  postalCode?: string;
}

// Note: Service types and insurance types are now defined in canonical.ts
// Import them from there for consistency
export type TravelMode = 'driving' | 'transit' | 'walking' | 'bicycling';
export type SortField = 'distance' | 'transit_time' | 'match_score' | 'rcs' | 'last_verified' | 'relevance';
export type SortOrder = 'asc' | 'desc';
export type AgeGroup = 'child' | 'teen' | 'adult' | 'senior';

/**
 * Canonical filter interface used by:
 * - Classic search UI (FilterPanel, SearchBar)
 * - LLM filter extraction (POST /llm/extract-filters)
 * - Search API (GET /api/resources/search)
 * - URL query parameters (shareable links)
 */
export interface CanonicalSearchFilters {
  // ============================================
  // TEXT SEARCH
  // ============================================
  /** Free-text keyword search across name, description, services */
  keywords?: string;

  /** Specific service types to filter by (use canonical codes from canonical.ts) */
  service_types?: string[];

  // ============================================
  // CARE PHASE (Phase-Gated Search) - REQUIRED
  // ============================================
  /**
   * Care phase for phase-gated search.
   * Values: immediate_crisis, acute_support, recovery_support, maintenance
   *
   * **REQUIRED FIELD** - User cannot search without selecting a care phase.
   *
   * - immediate_crisis: Emergency, safety, stabilization (hours-days)
   * - acute_support: Short-term intensive care (days-weeks)
   * - recovery_support: Rebuilding stability, SDOH (weeks-months)
   * - maintenance: Ongoing wellness, prevention (ongoing)
   *
   * See /docs/CARE_PHASE_MODEL.md for specification.
   * Implemented in bead bp95.
   */
  care_phase?: 'immediate_crisis' | 'acute_support' | 'recovery_support' | 'maintenance';

  // ============================================
  // LOCATION & DISTANCE - REQUIRED
  // ============================================
  /** Primary location for distance calculations */
  location?: SearchLocation;

  /** Maximum distance in kilometers */
  max_distance_km?: number;

  /** Maximum transit time in minutes (requires location) */
  max_transit_time_min?: number;

  /**
   * Preferred travel mode for transit calculations
   * @deprecated NOT IMPLEMENTED IN V2 API - Currently silently dropped by proxy
   * Requires PostGIS integration for transit time calculations
   */
  travel_mode?: TravelMode;

  // ============================================
  // SDOH - FINANCIAL ACCESSIBILITY
  // ============================================
  /** Accepted insurance types (use canonical codes from canonical.ts) */
  insurance?: string[];

  /** Facility offers sliding scale fees based on income */
  has_sliding_scale?: boolean;

  /** Facility offers charity care or financial assistance */
  has_charity_care?: boolean;

  /** Maximum cost per session in USD (if known) */
  max_cost_per_session?: number;

  // ============================================
  // SDOH - TRANSPORTATION
  // ============================================
  /** Public transit information available */
  has_transit?: boolean;

  /** Parking information available */
  has_parking?: boolean;

  /** Ride assistance programs available */
  has_ride_programs?: boolean;

  // ============================================
  // SDOH - POPULATION INCLUSIVITY
  // ============================================
  /** Languages offered (ISO 639-1 codes or names) */
  languages?: string[];

  /** LGBTQ+ affirming services */
  lgbtq_affirming?: boolean;

  /** Serves undocumented individuals */
  serves_undocumented?: boolean;

  /** Serves justice-involved individuals */
  serves_justice_involved?: boolean;

  /** Age groups served (child, adolescent, young_adult, adult, older_adult, all_ages) */
  age_groups?: AgeGroup[];

  /** Filter by gender served (male-only, female-only) - Implemented in bead q7cl */
  gender_specific?: 'male' | 'female';

  // ============================================
  // SDOH - ACCESSIBILITY
  // ============================================
  /** Wheelchair accessible facilities */
  wheelchair_accessible?: boolean;

  /** Telehealth/virtual options available */
  telehealth_available?: boolean;

  /** Minimum accessibility score (0-100) */
  min_accessibility_score?: number;

  /** ASL interpretation available */
  asl_interpretation?: boolean;

  // ============================================
  // AVAILABILITY & CAPACITY
  // ============================================
  /** Currently accepting new patients */
  accepting_patients?: boolean;

  /** Phase 2: Accepting new patients (v2 API field name) */
  acceptingNewPatients?: boolean;

  /** Phase 2: Only show facilities with urgent/same-day access */
  urgentAccessOnly?: boolean;

  /** Convenience filter for crisis services (matches any crisis service type) - Implemented in bead q58w */
  has_crisis_services?: boolean;

  /** Open now (based on current time) */
  open_now?: boolean;

  /** Available within X hours for urgent care */
  available_within_hours?: number;

  /** No waitlist or waitlist < X days */
  max_waitlist_days?: number;

  // ============================================
  // QUALITY SIGNALS
  // ============================================
  /** Minimum Resource Confidence Score (0.0-1.0) */
  min_rcs?: number;

  /** Only show verified facilities (RCS >= 0.85) */
  verified_only?: boolean;

  /** Verified within last X days */
  verified_within_days?: number;

  // ============================================
  // ADVANCED FILTERS
  // ============================================
  /** Evidence-based practices offered */
  evidence_based_practices?: string[];

  /** Specific accreditations required */
  accreditations?: string[];

  /** Treatment modalities offered */
  treatment_modalities?: string[];

  /** Walk-ins accepted (no appointment needed) - Implemented in bead o09d */
  walk_ins_accepted?: boolean;

  /** Referral required */
  referral_required?: boolean;

  // ============================================
  // REGION FILTER (Existing)
  // ============================================
  /**
   * Geographic region filter
   * @deprecated NOT IMPLEMENTED IN V2 API - Currently silently dropped by proxy
   * Use location + radius_km for geographic filtering instead
   */
  region?: 'denver-metro' | 'colorado-springs' | 'boulder' | 'fort-collins' | 'all';

  /** Specific city filter */
  city?: string;

  // ============================================
  // SORTING
  // ============================================
  /** Field to sort results by */
  sort_by?: SortField;

  /** Sort order */
  sort_order?: SortOrder;

  // ============================================
  // PAGINATION
  // ============================================
  /** Results per page */
  limit?: number;

  /** Offset for pagination */
  offset?: number;
}

/**
 * Match reason categories for explainability
 */
export type MatchReasonCategory =
  | 'insurance'
  | 'location'
  | 'service'
  | 'accessibility'
  | 'availability'
  | 'quality'
  | 'population'
  | 'financial';

/**
 * Confidence level for match reasons and field values
 */
export type ConfidenceLevel = 'verified' | 'inferred' | 'unknown';

/**
 * Match reason explaining why a resource was included in results
 */
export interface MatchReason {
  /** Category of the match */
  category: MatchReasonCategory;

  /** Specific field that matched */
  field: string;

  /** Value that was matched */
  matched_value: string | boolean | number;

  /** Confidence level of this match */
  confidence: ConfidenceLevel;

  /** When this field was last verified (null if never) */
  last_verified_at?: string;

  /** Human-readable explanation */
  explanation?: string;
}

/**
 * Provenance information for data attribution
 */
export interface Provenance {
  /** Data source (crawlbase, manual, verified, etc.) */
  source: string;

  /** Resource Confidence Score (0.0-1.0) */
  rcs: number;

  /** Last verified timestamp */
  last_verified_at?: string;

  /** Verification method */
  verification_method?: 'automated' | 'manual' | 'community';

  /** Who verified (user_id or 'system') */
  verified_by?: string;
}

/**
 * Resource search result with match information
 */
export interface ResourceSearchResult {
  /** Resource ID */
  id: string;

  /** Resource name */
  name: string;

  /** Display name (if different) */
  display_name?: string;

  /** Description */
  description?: string;

  /** Resource type */
  type: 'facility' | 'organization';

  /** Location information */
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;

  /** Contact information */
  phone_numbers?: string[];
  website?: string;
  email?: string;

  /** Match score (0.0-1.0) */
  match_score: number;

  /** Why this resource matched the search */
  match_reasons: MatchReason[];

  /** Fields we don't have data for */
  unknowns: string[];

  /** Data provenance */
  provenance: Provenance;

  /** Average RCS across all services */
  avg_rcs?: number;

  /** Services offered */
  services?: Array<{
    id: string;
    name: string;
    service_type?: string; // Canonical service type code
    rcs?: number;
  }>;

  /** Distance from search location (if provided) */
  distance_km?: number;

  /** Transit time from search location (if provided) */
  transit_time_min?: number;

  /** Accessibility score */
  accessibility_score?: number;

  /** Result tier for phase-gated search (bead 0fxp) */
  tier?: 'primary' | 'secondary' | 'suppressed';
}

/**
 * Search API response
 */
export interface SearchResponse {
  /** Search results */
  items: ResourceSearchResult[];

  /** Total count (for pagination) */
  total: number;

  /** Filters that were applied (echo back) */
  applied_filters: CanonicalSearchFilters;

  /** Search metadata */
  metadata: {
    /** Query execution time in ms */
    execution_time_ms: number;

    /** Whether results were cached */
    from_cache: boolean;

    /** Search timestamp */
    timestamp: string;
  };
}

/**
 * LLM filter extraction request
 */
export interface LLMFilterExtractionRequest {
  /** Natural language query */
  query: string;

  /** Optional context */
  context?: {
    /** Current user location */
    current_location?: LocationCoordinate;

    /** User type (care_coordinator, client, etc.) */
    user_type?: string;

    /** Conversation history for context */
    conversation_id?: string;
  };
}

/**
 * Ambiguity detected during filter extraction
 */
export interface FilterAmbiguity {
  /** Field that is ambiguous */
  field: string;

  /** Question to ask user */
  question: string;

  /** Possible options */
  options: Array<{
    label: string;
    value: string | boolean | number;
  }>;

  /** Whether this is critical (must be resolved before search) */
  is_critical: boolean;
}

/**
 * LLM filter extraction response
 */
export interface LLMFilterExtractionResponse {
  /** Original user query */
  originalQuery: string;

  /** Extracted filters */
  filters: CanonicalSearchFilters;

  /** Explanation of what was extracted */
  explanation: string;

  /** Confidence in extraction (0.0-1.0) */
  confidence: number;

  /** Detected ambiguities requiring clarification */
  ambiguities?: FilterAmbiguity[];

  /** Metadata */
  metadata: {
    /** LLM provider used */
    provider: string;

    /** Model used */
    model: string;

    /** Token usage */
    tokens: {
      input: number;
      output: number;
    };
  };
}

/**
 * Helper type for URL serialization
 */
export type SerializedFilters = Record<string, string | string[]>;

/**
 * Utility functions for filter manipulation
 */
export const FilterUtils = {
  /**
   * Serialize filters to URL query parameters
   */
  toURLParams(filters: CanonicalSearchFilters): URLSearchParams {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, String(v)));
      } else if (typeof value === 'object') {
        params.set(key, JSON.stringify(value));
      } else {
        params.set(key, String(value));
      }
    });

    return params;
  },

  /**
   * Parse filters from URL query parameters
   */
  fromURLParams(params: URLSearchParams): CanonicalSearchFilters {
    const filters: CanonicalSearchFilters = {};

    params.forEach((value, key) => {
      // Handle arrays
      if (params.getAll(key).length > 1) {
        (filters as any)[key] = params.getAll(key);
      }
      // Handle objects (JSON)
      else if (value.startsWith('{') || value.startsWith('[')) {
        try {
          (filters as any)[key] = JSON.parse(value);
        } catch {
          (filters as any)[key] = value;
        }
      }
      // Handle booleans
      else if (value === 'true' || value === 'false') {
        (filters as any)[key] = value === 'true';
      }
      // Handle numbers
      else if (!isNaN(Number(value))) {
        (filters as any)[key] = Number(value);
      }
      // Handle strings
      else {
        (filters as any)[key] = value;
      }
    });

    return filters;
  },

  /**
   * Count active filters (excluding pagination)
   */
  countActive(filters: CanonicalSearchFilters): number {
    const { limit, offset, sort_by, sort_order, ...activeFilters } = filters;
    return Object.keys(activeFilters).filter(
      key => activeFilters[key as keyof typeof activeFilters] !== undefined
    ).length;
  },

  /**
   * Merge two filter objects (second overrides first)
   */
  merge(
    base: CanonicalSearchFilters,
    override: Partial<CanonicalSearchFilters>
  ): CanonicalSearchFilters {
    return { ...base, ...override };
  },

  /**
   * Clear all filters
   */
  clear(): CanonicalSearchFilters {
    return {};
  },

  /**
   * Check if two filter sets are equal
   */
  areEqual(a: CanonicalSearchFilters, b: CanonicalSearchFilters): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
};

// ============================================================================
// Search API v2 Types (Phase 2 P0)
// ============================================================================

/**
 * Availability status from facilities table
 */
export interface AvailabilityStatus {
  accepting_new_patients?: boolean;
  current_capacity_status?: 'open' | 'limited' | 'waitlist' | 'full';
  typical_wait_days?: number;
  last_capacity_update?: string;
  waitlist_length?: number;
  urgent_access_available?: boolean;
  notes?: string;
}

/**
 * Search result from v2 API
 */
export interface SearchResultV2 {
  resource_id: string;
  resource_type: 'facility' | 'service';
  match: {
    score: number;
    criteria_met: string[];
    urgency_detected: boolean | null;
  };
  verification: {
    status: 'verified' | 'partially_verified' | 'unverified' | 'stale';
    last_verified_at: string | null;
    confidence_score: number;
    days_since_verification: number | null;
  };
  details: {
    name: string;
    display_name?: string;
    description?: string;
    phone_numbers?: string[];
    email?: string;
    website?: string;
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    distance_km?: number;
    hours_text?: string;
    languages_supported?: any;
    canonical_languages?: string[];
    language_labels?: string[];
    services: Array<{
      name: string;
      description?: string;
      canonical_type?: string;
      type_label?: string;
      raw_type?: string;
    }>;
    transportation_info?: any;
    accessibility_details?: any;
    financial_access?: any;
    availability_status?: AvailabilityStatus;
    population_policies?: any;
  };
}

/**
 * Search response from v2 API
 */
export interface SearchResponseV2 {
  total: number;
  results: SearchResultV2[];
  filters_applied: {
    query?: string;
    refined_query?: string;
    service_types: string[];
    insurance_types: string[];
    languages: string[];
    location?: string;
    radius_km?: number;
    verified_only: boolean;
    min_confidence?: number;
    accepting_new_patients?: boolean;
    urgent_access_only?: boolean;
    urgency_detected?: string;
    query_understanding?: any;
  };
  pagination: {
    limit: number;
    offset: number;
    has_more: boolean;
  };
  metadata?: {
    execution_time_ms: number;
    from_cache: boolean;
    timestamp: string;
    backend_url?: string;
  };
}
