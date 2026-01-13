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
    const response: LLMFilterExtractionResponse = {
      originalQuery: query,
      filters: {
        keywords: query,
        // Extract some basic patterns from query
        has_crisis_services: query.toLowerCase().includes('crisis'),
        urgentAccessOnly: query.toLowerCase().includes('urgent') || query.toLowerCase().includes('crisis') || query.toLowerCase().includes('emergency'),
        max_distance_km: 25, // Default 25km radius
      },
      explanation: `Searching for resources related to: "${query}". Prioritizing urgent access due to crisis-related keywords.`,
      confidence: 0.85,
      metadata: {
        provider: 'mock',
        model: 'mock-llm-v1',
        tokens: {
          input: query.length,
          output: 100,
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
