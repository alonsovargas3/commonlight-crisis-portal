/**
 * LLM Fallback Strategy
 *
 * If backend LLM extraction fails, fallback to direct LLM API calls.
 * Supports both OpenAI and Anthropic with automatic failover.
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { CanonicalSearchFilters, LLMFilterExtractionResponse } from '@/types/search';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface LLMProvider {
  name: string;
  extract: (query: string, context?: any) => Promise<LLMFilterExtractionResponse>;
}

/**
 * OpenAI Provider
 */
const OpenAIProvider: LLMProvider = {
  name: 'openai',
  async extract(query: string, context?: any): Promise<LLMFilterExtractionResponse> {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(query, context);

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('OpenAI returned empty response');

    const parsed = JSON.parse(content);

    return {
      originalQuery: query,
      filters: parsed.filters || {},
      explanation: parsed.explanation || `Extracted filters from: "${query}"`,
      confidence: parsed.confidence || 0.7,
      metadata: {
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        tokens: {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
        },
      },
    };
  },
};

/**
 * Anthropic Provider
 */
const AnthropicProvider: LLMProvider = {
  name: 'anthropic',
  async extract(query: string, context?: any): Promise<LLMFilterExtractionResponse> {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(query, context);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Anthropic returned non-text response');
    }

    const parsed = JSON.parse(content.text);

    return {
      originalQuery: query,
      filters: parsed.filters || {},
      explanation: parsed.explanation || `Extracted filters from: "${query}"`,
      confidence: parsed.confidence || 0.7,
      metadata: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        tokens: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
      },
    };
  },
};

/**
 * Fallback orchestrator with provider priority
 */
export async function extractFiltersWithFallback(
  query: string,
  context?: any
): Promise<LLMFilterExtractionResponse> {
  // Try providers in order: OpenAI → Anthropic
  const providers = [OpenAIProvider, AnthropicProvider].filter(
    p => (p.name === 'openai' && OPENAI_API_KEY) ||
        (p.name === 'anthropic' && ANTHROPIC_API_KEY)
  );

  if (providers.length === 0) {
    throw new Error('No LLM providers configured (missing API keys)');
  }

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      console.log(`[LLM Fallback] Trying ${provider.name}...`);
      const result = await provider.extract(query, context);
      console.log(`[LLM Fallback] Success with ${provider.name}`);
      return result;
    } catch (error) {
      console.error(`[LLM Fallback] ${provider.name} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error('All LLM providers failed');
}

/**
 * Build system prompt for filter extraction
 */
function buildSystemPrompt(): string {
  return `You are a filter extraction assistant for a mental health resource search system.

Extract structured filters from natural language queries and return JSON in this EXACT format:

{
  "filters": {
    "keywords": "string (optional)",
    "care_phase": "immediate_crisis" | "acute_support" | "recovery_support" | "maintenance" (optional),
    "service_types": ["string"] (optional),
    "insurance": ["medicaid", "medicare", "private", "uninsured"] (optional),
    "languages": ["en", "es", "zh", etc.] (optional - use ISO 639-1 codes),
    "age_groups": ["child", "teen", "adult", "senior"] (optional),
    "gender_specific": "male" | "female" (optional),
    "has_crisis_services": boolean (optional),
    "walk_ins_accepted": boolean (optional),
    "urgentAccessOnly": boolean (optional),
    "lgbtq_affirming": boolean (optional),
    "wheelchair_accessible": boolean (optional),
    "telehealth_available": boolean (optional)
  },
  "explanation": "Brief explanation of what was extracted (1-2 sentences)",
  "confidence": 0.0-1.0 (number)
}

Care Phase Definitions:
- immediate_crisis: Emergency, suicide risk, immediate danger (hours-days)
- acute_support: Short-term intensive care, recent trauma (days-weeks)
- recovery_support: Rebuilding stability, SDOH needs (weeks-months)
- maintenance: Ongoing wellness, prevention (ongoing)

Service Type Examples:
- "crisis_line", "crisis_hotline", "emergency_services"
- "therapy", "counseling", "psychiatric_care"
- "substance_use_treatment", "detox", "residential_treatment"
- "case_management", "housing_assistance", "food_assistance"

IMPORTANT:
- Only extract filters that are explicitly mentioned or clearly implied
- Set confidence < 0.7 if the query is ambiguous
- Use keywords field for general search terms
- Return ONLY the JSON object, no additional text`;
}

/**
 * Build user prompt with query and context
 */
function buildUserPrompt(query: string, context?: any): string {
  let prompt = `Extract filters from this query: "${query}"`;

  if (context?.current_location) {
    prompt += `\n\nUser location: ${context.current_location.lat}, ${context.current_location.lon}`;
  }

  if (context?.user_type) {
    prompt += `\nUser type: ${context.user_type}`;
  }

  return prompt;
}
