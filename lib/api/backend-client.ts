/**
 * Backend API Client
 *
 * Handles all communication with FastAPI backend.
 * Implements retry logic, error handling, and response transformation.
 */

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://api.wearecommonlight.com';
const FASTAPI_API_KEY = process.env.FASTAPI_API_KEY || '';

interface RetryOptions {
  maxRetries: number;
  backoffMs: number;
  retryableStatuses: number[];
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  backoffMs: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Base fetch with retry logic and error handling
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: Partial<RetryOptions> = {}
): Promise<Response> {
  const { maxRetries, backoffMs, retryableStatuses } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...retryOptions,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Build headers - only include Authorization if API key is set
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      if (FASTAPI_API_KEY) {
        headers['Authorization'] = `Bearer ${FASTAPI_API_KEY}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Success - return response
      if (response.ok) {
        return response;
      }

      // Check if error is retryable
      if (!retryableStatuses.includes(response.status)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Network errors are retryable
      if (attempt === maxRetries) {
        throw lastError;
      }
    }

    // Wait before retry with exponential backoff
    if (attempt < maxRetries) {
      const delay = backoffMs * Math.pow(2, attempt);
      console.log(`[Backend Client] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export class BackendAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: any
  ) {
    super(message);
    this.name = 'BackendAPIError';
  }
}

/**
 * Backend API Client
 */
export const BackendClient = {
  /**
   * Extract filters from natural language query
   */
  async extractFilters(
    query: string,
    context?: {
      current_location?: { lat: number; lon: number };
      user_type?: string;
    }
  ): Promise<any> {
    try {
      const response = await fetchWithRetry(
        `${FASTAPI_URL}/llm/extract-filters`,
        {
          method: 'POST',
          body: JSON.stringify({ query, context }),
        }
      );

      return await response.json();
    } catch (error) {
      console.error('[Backend Client] Filter extraction failed:', error);
      throw new BackendAPIError(
        'Failed to extract filters from query',
        undefined,
        { originalError: error }
      );
    }
  },

  /**
   * Search resources
   */
  async searchResources(
    params: Record<string, string>
  ): Promise<any> {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetchWithRetry(
        `${FASTAPI_URL}/v2/resources/search?${queryString}`,
        { method: 'GET' }
      );

      return await response.json();
    } catch (error) {
      console.error('[Backend Client] Resource search failed:', error);
      throw new BackendAPIError(
        'Failed to search resources',
        undefined,
        { originalError: error }
      );
    }
  },

  /**
   * Get resource by ID
   */
  async getResourceById(resourceId: string): Promise<any> {
    try {
      const response = await fetchWithRetry(
        `${FASTAPI_URL}/v2/resources/${resourceId}`,
        { method: 'GET' }
      );

      return await response.json();
    } catch (error) {
      console.error('[Backend Client] Get resource failed:', error);
      throw new BackendAPIError(
        'Failed to get resource details',
        undefined,
        { originalError: error }
      );
    }
  },
};
