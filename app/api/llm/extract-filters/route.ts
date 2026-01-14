import { NextRequest, NextResponse } from 'next/server';
import type { LLMFilterExtractionRequest, LLMFilterExtractionResponse } from '@/types/search';

/**
 * POST /api/llm/extract-filters
 *
 * Mock LLM filter extraction endpoint
 *
 * TODO: Replace with actual LLM integration (OpenAI, Anthropic, etc.)
 * This should:
 * 1. Take natural language query
 * 2. Use LLM to extract structured filters
 * 3. Return CanonicalSearchFilters + confidence + ambiguities
 */
export async function POST(request: NextRequest) {
  try {
    const body: LLMFilterExtractionRequest = await request.json();
    const { query, context } = body;

    console.log('LLM Extract Filters Request:', { query, context });

    // Mock response - in production, this would call an LLM API
    const queryLower = query.toLowerCase();

    // Extract care_phase [bead bp95]
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

    // Extract gender_specific [bead q7cl]
    let gender_specific: 'male' | 'female' | undefined;
    if (queryLower.includes('women') || queryLower.includes('female') || queryLower.includes('girls')) {
      gender_specific = 'female';
    } else if (queryLower.includes('men') || queryLower.includes('male') || queryLower.includes('boys')) {
      gender_specific = 'male';
    }

    // Extract has_crisis_services [bead q58w]
    const has_crisis_services = queryLower.includes('crisis') || queryLower.includes('emergency') || queryLower.includes('hotline');

    // Extract access method [bead o09d]
    const walk_ins_accepted = queryLower.includes('walk-in') || queryLower.includes('walk in') || queryLower.includes('drop-in') || queryLower.includes('drop in') || queryLower.includes('no appointment') || queryLower.includes('without appointment');
    const referral_required = queryLower.includes('referral') || queryLower.includes('referred') || queryLower.includes('recommendation') || queryLower.includes('by referral');

    // Build explanation components
    const explanationParts: string[] = [`Searching for resources related to: "${query}".`];
    if (care_phase) explanationParts.push(`Identified care phase: ${care_phase}.`);
    if (gender_specific) explanationParts.push(`Filtering for ${gender_specific}-specific services.`);
    if (has_crisis_services) explanationParts.push('Prioritizing crisis services.');
    if (walk_ins_accepted) explanationParts.push('Showing walk-in accessible facilities.');
    if (referral_required) explanationParts.push('Showing referral-based services.');

    const response: LLMFilterExtractionResponse = {
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
      confidence: 0.85,
      metadata: {
        provider: 'mock',
        model: 'mock-llm-v1',
        tokens: {
          input: query.length,
          output: 150,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('LLM extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract filters' },
      { status: 500 }
    );
  }
}
