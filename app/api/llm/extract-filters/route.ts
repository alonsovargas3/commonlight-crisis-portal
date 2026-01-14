import { NextRequest, NextResponse } from 'next/server';
import type { LLMFilterExtractionRequest, LLMFilterExtractionResponse } from '@/types/search';
import { BackendClient, BackendAPIError } from '@/lib/api/backend-client';
import { extractFiltersWithFallback } from '@/lib/api/llm-fallback';

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

    // Strategy 1: Try backend API first
    try {
      const backendResponse = await BackendClient.extractFilters(
        query,
        context ? {
          current_location: context.current_location,
          user_type: context.user_type,
        } : undefined
      );

      console.log('[LLM Extract] Backend success');

      // Backend returns compatible format, just pass through
      return NextResponse.json(backendResponse);

    } catch (backendError) {
      console.warn('[LLM Extract] Backend failed, trying fallback:', backendError);

      // Strategy 2: Fallback to direct LLM API calls
      try {
        const fallbackResponse = await extractFiltersWithFallback(query, context);

        console.log('[LLM Extract] Fallback success with', fallbackResponse.metadata.provider);

        return NextResponse.json(fallbackResponse);

      } catch (fallbackError) {
        console.error('[LLM Extract] All LLM providers failed:', fallbackError);

        // Strategy 3: Return basic keyword-based filters (last resort)
        const basicFilters: LLMFilterExtractionResponse = createBasicFilters(query);

        console.log('[LLM Extract] Using basic fallback');

        return NextResponse.json(basicFilters);
      }
    }

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
