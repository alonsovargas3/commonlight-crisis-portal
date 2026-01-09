"use client";

import { SearchResponse } from "@/types/search";
import { CrisisResourceCard } from "./CrisisResourceCard";
import { AlertCircle, Map as MapIcon, List } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CrisisMap } from "./CrisisMap";

interface CrisisSearchResultsProps {
  results: SearchResponse;
  userLocation?: { lat: number; lng: number };
}

/**
 * Crisis Search Results Component
 *
 * FindHelp-inspired side-by-side layout:
 * - Map on left (desktop) / top (mobile)
 * - Results list on right (desktop) / bottom (mobile)
 * - Toggle between map and list on mobile
 */
export function CrisisSearchResults({ results, userLocation }: CrisisSearchResultsProps) {
  const { items, total } = results;
  const [showMap, setShowMap] = useState(true);

  if (total === 0) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-900 dark:text-yellow-100">
          <div className="space-y-2">
            <p className="font-medium">No resources found</p>
            <p className="text-sm">
              Try:
            </p>
            <ul className="text-sm list-disc list-inside space-y-1">
              <li>Adjusting your filters (try turning off "Open now")</li>
              <li>Using different search terms</li>
              <li>Selecting a different location</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-2xl text-gray-900 dark:text-gray-100 mr-2">
            {total.toLocaleString()}
          </span>
          <span>resource{total !== 1 ? 's' : ''} found</span>
        </div>

        {/* Mobile Toggle */}
        <div className="flex lg:hidden gap-2">
          <Button
            variant={showMap ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMap(true)}
            className="gap-2"
          >
            <MapIcon className="h-4 w-4" />
            Map
          </Button>
          <Button
            variant={!showMap ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMap(false)}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      {/* Map + List Layout */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Map - Left side on desktop, toggleable on mobile */}
        <div className={`${showMap ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-20">
            <CrisisMap
              resources={items}
              userLocation={userLocation}
            />
          </div>
        </div>

        {/* Results List - Right side on desktop, toggleable on mobile */}
        <div className={`${!showMap ? 'block' : 'hidden'} lg:block space-y-4`}>
          {items.map((item, index) => (
            <CrisisResourceCard
              key={item.id}
              resource={item}
              userLocation={userLocation}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
