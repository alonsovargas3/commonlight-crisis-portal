"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, Loader2, Filter as FilterIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "@/components/crisis/LocationSelector";
import { CrisisSearchResults } from "@/components/crisis/CrisisSearchResults";
import { CrisisFilters } from "@/components/crisis/CrisisFilters";
import type { CanonicalSearchFilters, LLMFilterExtractionResponse, SearchResponse } from "@/types/search";
import { FilterUtils } from "@/types/search";

/**
 * Crisis Search Results Page
 *
 * Handles:
 * - Natural language query processing via LLM
 * - Location-aware search (required)
 * - Minimal filters (max 4)
 * - Clean, focused results display
 */
function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const location = useLocation();

  // State
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CanonicalSearchFilters>({});
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [lastExtraction, setLastExtraction] = useState<LLMFilterExtractionResponse | null>(null);

  // Process URL query parameter when location is ready
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && location && !query) {
      // Only trigger if we haven't set the query yet (prevents duplicate searches)
      setQuery(urlQuery);
      handleSearch(urlQuery);
      // Clean URL
      router.replace('/crisis/search', { scroll: false });
    }
  }, [location]); // Run when location becomes available

  // Handle natural language search
  const handleSearch = useCallback(async (searchQuery?: string) => {
    const queryToUse = searchQuery || query;

    // Validate location
    if (!location) {
      alert("Please select a location first");
      router.push('/crisis');
      return;
    }

    // Validate query
    if (!queryToUse.trim()) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Extract filters using LLM
      console.log('Extracting filters for query:', queryToUse);
      const extractResponse = await fetch('/api/llm/extract-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToUse,
          context: {
            current_location: location.coordinates
              ? { lat: location.coordinates.lat, lon: location.coordinates.lng }
              : undefined,
            user_type: 'crisis_worker',
          },
        }),
      });

      if (!extractResponse.ok) {
        throw new Error('Failed to process search query');
      }

      const extraction: LLMFilterExtractionResponse = await extractResponse.json();
      console.log('LLM extraction result:', extraction);
      setLastExtraction(extraction);

      // Step 2: Apply extracted filters + location
      const searchFilters: CanonicalSearchFilters = {
        ...extraction.filters,
        // Add location from selector
        location: location.coordinates
          ? {
              address: location.displayName,
              city: location.name.split(',')[0],
              state: location.name.split(',')[1]?.trim(),
              postalCode: undefined,
              coordinates: {
                lat: location.coordinates.lat,
                lon: location.coordinates.lng,
              },
            }
          : undefined,
        // Default: show only "Open now" resources for crisis workers
        urgentAccessOnly: extraction.filters.urgentAccessOnly ?? true,
      };

      setFilters(searchFilters);
      setIsProcessing(false);

      // Step 3: Execute search
      await executeSearch(searchFilters);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setIsProcessing(false);
      setIsSearching(false);
    }
  }, [query, location, router]);

  // Execute search with given filters
  const executeSearch = useCallback(async (searchFilters: CanonicalSearchFilters) => {
    setIsSearching(true);
    setError(null);

    try {
      const params = FilterUtils.toURLParams(searchFilters);
      const url = `/api/resources/search?${params.toString()}`;
      console.log('Searching:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      console.log('Search results:', data);
      setResults(data);
    } catch (err) {
      console.error('Search execution error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: CanonicalSearchFilters) => {
    setFilters(newFilters);
    executeSearch(newFilters);
  }, [executeSearch]);

  // Handle new search
  const handleNewSearch = useCallback(() => {
    router.push('/crisis');
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Loading Overlay - Full screen during LLM processing */}
      {isProcessing && (
        <div className="fixed inset-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Finding resources...
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Analyzing your search
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with search */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Describe what you need..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pr-10"
                  disabled={isProcessing}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Button
                type="submit"
                disabled={!query.trim() || !location || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleNewSearch}
              >
                New Search
              </Button>
            </form>

            {/* Filters Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 truncate max-w-full sm:max-w-md">
                {lastExtraction && (
                  <span className="italic truncate">
                    "{lastExtraction.originalQuery}"
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 shrink-0"
                aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                aria-expanded={showFilters}
              >
                <FilterIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <CrisisFilters
                filters={filters}
                onChange={handleFilterChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-7xl">
          {/* Location Alert */}
          {!location && (
            <Alert variant="default" className="mb-4 sm:mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/50">
              <MapPin className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm sm:text-base">
                Please select a location in the top bar
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4 sm:mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm sm:text-base">
                <div className="font-medium mb-1">Search Error</div>
                <div>{error}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    if (query) handleSearch();
                  }}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State - Results */}
          {isSearching && !isProcessing && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4">
              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-blue-600" />
              <div className="text-center space-y-1">
                <div className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                  Searching resources...
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  This may take a few seconds
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {!isSearching && !isProcessing && results && (
            <CrisisSearchResults
              results={results}
              userLocation={location?.coordinates}
            />
          )}
      </div>
    </div>
  );
}

export default function CrisisSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
