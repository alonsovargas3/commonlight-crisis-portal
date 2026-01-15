import { NextRequest, NextResponse } from 'next/server';
import type { LLMFilterExtractionRequest, LLMFilterExtractionResponse } from '@/types/search';
import { BackendClient, BackendAPIError } from '@/lib/api/backend-client';
import { extractFiltersWithFallback } from '@/lib/api/llm-fallback';

/**
 * Valid canonical service type codes from backend
 * Source: backend/vocabularies/canonical_codes.py
 */
const VALID_SERVICE_TYPES = new Set([
  // Crisis services
  'crisis_line', 'crisis_text', 'crisis_chat', 'crisis_mobile',
  'crisis_walk_in', 'crisis_stabilization', 'suicide_prevention',
  // Inpatient
  'inpatient_psychiatric', 'inpatient_dual_diagnosis',
  'residential_long_term', 'residential_short_term', 'partial_hospitalization',
  // Outpatient
  'outpatient_therapy', 'intensive_outpatient', 'medication_management',
  'telehealth_therapy', 'case_management', 'peer_support',
  // Substance use
  'detox', 'detox_social', 'sud_inpatient', 'sud_outpatient',
  'mat', 'recovery_support', 'harm_reduction',
  // Support groups
  'support_group_general', 'support_group_aa', 'support_group_na',
  'support_group_smart', 'support_group_family', 'support_group_grief',
  // SDOH
  'housing', 'food', 'transportation', 'legal', 'employment',
  'healthcare', 'education', 'financial',
]);

/**
 * Mapping for common LLM mistakes to correct canonical codes
 */
const SERVICE_TYPE_ALIASES: Record<string, string> = {
  'crisis_hotline': 'crisis_line',
  'hotline': 'crisis_line',
  'emergency_services': 'crisis_line',
  'emergency': 'crisis_line',
  '988': 'crisis_line',
  'suicide_hotline': 'suicide_prevention',
  'mental_health': 'outpatient_therapy',
  'therapy': 'outpatient_therapy',
  'counseling': 'outpatient_therapy',
  'inpatient': 'inpatient_psychiatric',
  'residential': 'residential_short_term',
  'rehab': 'sud_inpatient',
  'detoxification': 'detox',
};

/**
 * Validate and clean extracted filters by mapping and removing invalid service types
 */
function validateExtractedFilters(response: LLMFilterExtractionResponse, originalQuery: string): LLMFilterExtractionResponse {
  if (response.filters?.service_types) {
    const mappedTypes: string[] = [];
    const invalidTypes: string[] = [];

    response.filters.service_types.forEach(type => {
      // Check if valid
      if (VALID_SERVICE_TYPES.has(type)) {
        mappedTypes.push(type);
      }
      // Check if has alias mapping
      else if (SERVICE_TYPE_ALIASES[type]) {
        const mapped = SERVICE_TYPE_ALIASES[type];
        console.log(`[LLM Extract] Mapped "${type}" → "${mapped}"`);
        mappedTypes.push(mapped);
      }
      // Invalid and no mapping
      else {
        invalidTypes.push(type);
      }
    });

    if (invalidTypes.length > 0) {
      console.warn('[LLM Extract] Removed invalid service types (no mapping):', invalidTypes);
    }

    response.filters.service_types = [...new Set(mappedTypes)]; // Remove duplicates

    // If no service types remain after filtering, preserve original query as keywords
    if (response.filters.service_types.length === 0 && originalQuery) {
      console.log('[LLM Extract] No valid service types extracted, preserving original query as keywords');
      response.filters.keywords = originalQuery;
    }
  }

  return response;
}

/**
 * POST /api/llm/extract-filters
 *
 * Extract structured filters from natural language query using backend LLM service.
 * Implements multi-tier fallback strategy for high availability:
 * 1. Backend LLM service (primary)
 * 2. Direct OpenAI API call (fallback 1)
 * 3. Direct Anthropic API call (fallback 2)
 * 4. Basic keyword matching (last resort)
 */
export async function POST(request: NextRequest) {
  try {
    const body: LLMFilterExtractionRequest = await request.json();
    const { query, context } = body;

    console.log('[LLM Extract] Request:', { query, context });

    // Validate input
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // PERFORMANCE: Backend LLM is currently failing (HTTP 500)
    // Skip it entirely to avoid 7+ seconds of wasted retries
    // TODO: Re-enable when backend LLM is fixed

    // Strategy 1: Direct LLM API calls (OpenAI/Anthropic)
    try {
      const fallbackResponse = await extractFiltersWithFallback(query, context);

      console.log('[LLM Extract] Success with', fallbackResponse.metadata.provider);

      // Validate and clean extracted filters
      const validatedResponse = validateExtractedFilters(fallbackResponse, query);
      return NextResponse.json(validatedResponse);

    } catch (llmError) {
      console.error('[LLM Extract] LLM providers failed:', llmError);

      // Strategy 2: Return basic keyword-based filters (last resort)
      const basicFilters: LLMFilterExtractionResponse = createBasicFilters(query);

      console.log('[LLM Extract] Using basic keyword fallback');

      // Validate and clean extracted filters
      const validatedResponse = validateExtractedFilters(basicFilters, query);
      return NextResponse.json(validatedResponse);
    }

    // NOTE: Backend LLM extraction disabled due to consistent HTTP 500 errors
    // Uncomment when backend /llm/extract-filters is fixed:
    /*
    try {
      const backendResponse = await BackendClient.extractFilters(
        query,
        context ? {
          current_location: context.current_location,
          user_type: context.user_type,
        } : undefined
      );

      console.log('[LLM Extract] Backend success');
      const validatedResponse = validateExtractedFilters(backendResponse, query);
      return NextResponse.json(validatedResponse);

    } catch (backendError) {
      console.warn('[LLM Extract] Backend failed, trying fallback:', backendError);
      // ... fallback logic
    }
    */

  } catch (error) {
    console.error('[LLM Extract] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract filters',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * Create basic keyword-based filters as last resort
 */
function createBasicFilters(query: string): LLMFilterExtractionResponse {
  const queryLower = query.toLowerCase();

  // Extract care_phase using keyword matching
  let care_phase: 'immediate_crisis' | 'acute_support' | 'recovery_support' | 'maintenance' | undefined;
  if (queryLower.includes('emergency') || queryLower.includes('suicide') || queryLower.includes('immediate') || queryLower.includes('crisis')) {
    care_phase = 'immediate_crisis';
  } else if (queryLower.includes('acute') || queryLower.includes('urgent') || queryLower.includes('recent')) {
    care_phase = 'acute_support';
  } else if (queryLower.includes('recovery') || queryLower.includes('rehabilitation') || queryLower.includes('ongoing')) {
    care_phase = 'recovery_support';
  } else if (queryLower.includes('maintenance') || queryLower.includes('preventive') || queryLower.includes('wellness')) {
    care_phase = 'maintenance';
  }

  // Extract gender_specific
  let gender_specific: 'male' | 'female' | undefined;
  if (queryLower.includes('women') || queryLower.includes('female') || queryLower.includes('girls')) {
    gender_specific = 'female';
  } else if (queryLower.includes('men') || queryLower.includes('male') || queryLower.includes('boys')) {
    gender_specific = 'male';
  }

  // Extract has_crisis_services
  const has_crisis_services = queryLower.includes('crisis') || queryLower.includes('emergency') || queryLower.includes('hotline');

  // Extract access method
  const walk_ins_accepted = queryLower.includes('walk-in') || queryLower.includes('walk in') || queryLower.includes('drop-in') || queryLower.includes('drop in') || queryLower.includes('no appointment') || queryLower.includes('without appointment');
  const referral_required = queryLower.includes('referral') || queryLower.includes('referred') || queryLower.includes('recommendation') || queryLower.includes('by referral');

  // Build explanation
  const explanationParts: string[] = [`Searching for resources related to: "${query}".`];
  if (care_phase) explanationParts.push(`Identified care phase: ${care_phase}.`);
  if (gender_specific) explanationParts.push(`Filtering for ${gender_specific}-specific services.`);
  if (has_crisis_services) explanationParts.push('Prioritizing crisis services.');
  if (walk_ins_accepted) explanationParts.push('Showing walk-in accessible facilities.');
  if (referral_required) explanationParts.push('Showing referral-based services.');

  explanationParts.push('(Using basic keyword matching - LLM services unavailable)');

  return {
    originalQuery: query,
    filters: {
      keywords: query,
      care_phase,
      has_crisis_services: has_crisis_services || undefined,
      gender_specific,
      walk_ins_accepted: walk_ins_accepted || undefined,
      referral_required: referral_required || undefined,
      urgentAccessOnly: queryLower.includes('urgent') || queryLower.includes('crisis') || queryLower.includes('emergency') || queryLower.includes('now') || queryLower.includes('immediate'),
      max_distance_km: 25, // Default 25km radius
    },
    explanation: explanationParts.join(' '),
    confidence: 0.3,
    metadata: {
      provider: 'fallback',
      model: 'keyword-matching',
      tokens: {
        input: query.length,
        output: 50,
      },
    },
  };
}
