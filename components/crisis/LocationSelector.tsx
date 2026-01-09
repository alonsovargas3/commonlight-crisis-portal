"use client";

import { useState, useEffect } from "react";
import { MapPin, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

/**
 * Location data type
 */
interface Location {
  id: string;
  name: string;
  displayName: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Common US cities for crisis workers
 * In production, this would come from an API or be user-configurable
 */
const COMMON_LOCATIONS: Location[] = [
  { id: "denver-co", name: "Denver, CO", displayName: "Denver, CO", coordinates: { lat: 39.7392, lng: -104.9903 } },
  { id: "boulder-co", name: "Boulder, CO", displayName: "Boulder, CO", coordinates: { lat: 40.0150, lng: -105.2705 } },
  { id: "colorado-springs-co", name: "Colorado Springs, CO", displayName: "Colorado Springs, CO", coordinates: { lat: 38.8339, lng: -104.8214 } },
  { id: "fort-collins-co", name: "Fort Collins, CO", displayName: "Fort Collins, CO", coordinates: { lat: 40.5853, lng: -105.0844 } },
  { id: "aurora-co", name: "Aurora, CO", displayName: "Aurora, CO", coordinates: { lat: 39.7294, lng: -104.8319 } },
];

const LOCATION_STORAGE_KEY = "crisis_worker_location";

/**
 * LocationSelector Component
 *
 * Always-visible location selector in the top bar.
 * Location is REQUIRED for all searches.
 * Persists selection in localStorage.
 */
export function LocationSelector() {
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocationId = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (savedLocationId) {
      const location = COMMON_LOCATIONS.find(loc => loc.id === savedLocationId);
      if (location) {
        setSelectedLocation(location);
      }
    }
  }, []);

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
    localStorage.setItem(LOCATION_STORAGE_KEY, location.id);
    setOpen(false);

    // Dispatch custom event for same-page components to react to location change
    window.dispatchEvent(new CustomEvent("locationChanged", { detail: location }));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select location"
          className={cn(
            "w-full justify-between gap-2 font-normal",
            !selectedLocation && "text-gray-500"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 shrink-0 text-blue-600" />
            <span className="truncate">
              {selectedLocation ? selectedLocation.displayName : "Select location"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="center">
        <Command>
          <CommandInput
            placeholder="Search locations..."
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No location found.</CommandEmpty>
            <CommandGroup heading="Common Locations">
              {COMMON_LOCATIONS.map((location) => (
                <CommandItem
                  key={location.id}
                  value={location.name}
                  onSelect={() => handleSelectLocation(location)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedLocation?.id === location.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                  {location.displayName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Hook to access current location in other components
 */
export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    const savedLocationId = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (savedLocationId) {
      const loc = COMMON_LOCATIONS.find(l => l.id === savedLocationId);
      if (loc) {
        setLocation(loc);
      }
    }

    // Listen for location changes from LocationSelector (same page)
    const handleLocationChange = (event: Event) => {
      const customEvent = event as CustomEvent<Location>;
      setLocation(customEvent.detail);
    };

    // Listen for storage changes (location updates from other tabs/windows)
    const handleStorageChange = () => {
      const newLocationId = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (newLocationId) {
        const loc = COMMON_LOCATIONS.find(l => l.id === newLocationId);
        setLocation(loc || null);
      }
    };

    window.addEventListener("locationChanged", handleLocationChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("locationChanged", handleLocationChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return location;
}
