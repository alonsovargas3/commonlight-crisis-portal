"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface Resource {
  id: string;
  name: string;
  display_name?: string;
  city?: string;
  state?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

interface CrisisMapProps {
  resources: Resource[];
  userLocation?: { lat: number; lng: number };
}

/**
 * Crisis Map Component
 *
 * Simple, clean map showing resource locations
 * Uses Google Maps-style design
 */
export function CrisisMap({ resources, userLocation }: CrisisMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter resources with valid coordinates
  const mappableResources = resources.filter(
    (r) => r.coordinates && r.coordinates.lat && r.coordinates.lon
  );

  // Calculate map center and bounds
  const getMapCenter = () => {
    if (userLocation) {
      return { lat: userLocation.lat, lng: userLocation.lng };
    }

    if (mappableResources.length > 0) {
      const avgLat =
        mappableResources.reduce((sum, r) => sum + (r.coordinates?.lat || 0), 0) /
        mappableResources.length;
      const avgLon =
        mappableResources.reduce((sum, r) => sum + (r.coordinates?.lon || 0), 0) /
        mappableResources.length;
      return { lat: avgLat, lng: avgLon };
    }

    // Default to Denver if no data
    return { lat: 39.7392, lng: -104.9903 };
  };

  const mapCenter = getMapCenter();

  return (
    <div className="w-full h-[400px] lg:h-[600px] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg relative">
      {/* Placeholder map with SVG illustration */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="800" height="600" fill="url(#grid)" />
        </svg>
      </div>

      {/* Map content */}
      <div className="absolute inset-0 p-6">
        {/* Location markers */}
        <div className="relative w-full h-full flex items-center justify-center">
          {mappableResources.length > 0 ? (
            <div className="grid grid-cols-3 gap-8">
              {mappableResources.slice(0, 9).map((resource, index) => (
                <div
                  key={resource.id}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                  onClick={() => setSelectedId(resource.id)}
                >
                  <div
                    className={`p-3 rounded-full transition-all duration-200 ${
                      selectedId === resource.id
                        ? 'bg-blue-700 scale-125 shadow-lg'
                        : 'bg-blue-600 group-hover:bg-blue-700 group-hover:scale-110 shadow-md'
                    }`}
                  >
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  {selectedId === resource.id && (
                    <div className="bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium text-gray-900 dark:text-gray-100 max-w-[150px] text-center">
                      {resource.display_name || resource.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No location data available</p>
            </div>
          )}
        </div>

        {/* User location marker */}
        {userLocation && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
              <div className="relative p-2 bg-blue-600 rounded-full border-2 border-white shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Map controls overlay */}
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg shadow-md text-xs font-medium text-gray-700 dark:text-gray-300">
          <MapPin className="h-3.5 w-3.5 inline-block mr-1.5 text-blue-700" />
          {mappableResources.length} location{mappableResources.length !== 1 ? 's' : ''}
        </div>

        {/* Note about map */}
        <div className="absolute bottom-4 right-4 bg-gray-900/80 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-gray-200 dark:text-gray-300">
          Interactive map coming soon
        </div>
      </div>
    </div>
  );
}
