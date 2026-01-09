"use client";

import { useState } from "react";
import { CanonicalSearchFilters } from "@/types/search";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CrisisFiltersProps {
  filters: CanonicalSearchFilters;
  onChange: (filters: CanonicalSearchFilters) => void;
}

/**
 * Crisis Filters Component
 *
 * Implements minimal filters (max 4) as per PRD:
 * 1. Open now
 * 2. Distance / travel time
 * 3. Eligibility (insurance)
 * 4. Access method (walk-in, referral, etc.)
 *
 * Mobile optimizations:
 * - Collapsible drawer on mobile
 * - Larger touch targets (min 44px)
 * - Clear visual indicators
 * - Filter count badge
 */
export function CrisisFilters({ filters, onChange }: CrisisFiltersProps) {
  const [open, setOpen] = useState(false);

  const updateFilter = <K extends keyof CanonicalSearchFilters>(
    key: K,
    value: CanonicalSearchFilters[K]
  ) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  // Count active filters
  const activeFilterCount = [
    filters.urgentAccessOnly,
    filters.insurance && filters.insurance.length > 0,
    filters.walk_ins_accepted || filters.referral_required,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Filter 1: Open Now */}
      <div className="space-y-3">
        <div className="flex items-center justify-between min-h-[44px]">
          <Label htmlFor="open-now" className="text-sm font-semibold text-gray-900 dark:text-white">
            Open Now
          </Label>
          <Switch
            id="open-now"
            checked={filters.urgentAccessOnly ?? true}
            onCheckedChange={(checked) => updateFilter('urgentAccessOnly', checked)}
            className="data-[state=checked]:bg-blue-700"
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          Show only resources available right now
        </p>
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Filter 2: Distance */}
      <div className="space-y-3">
        <Label htmlFor="distance" className="text-sm font-semibold text-gray-900 dark:text-white block">
          Max Distance
        </Label>
        <div className="flex items-center gap-3">
          <Slider
            id="distance"
            min={5}
            max={100}
            step={5}
            value={[filters.max_distance_km || 50]}
            onValueChange={([value]) => updateFilter('max_distance_km', value)}
            className="flex-1"
            aria-label={`Maximum distance: ${filters.max_distance_km || 50} kilometers`}
          />
          <div className="min-w-[60px] text-right">
            <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
              {filters.max_distance_km || 50}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">km</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Show resources within this radius
        </p>
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Filter 3: Eligibility (Insurance) */}
      <div className="space-y-3">
        <Label htmlFor="insurance" className="text-sm font-semibold text-gray-900 dark:text-white block">
          Insurance Accepted
        </Label>
        <Select
          value={filters.insurance?.[0] || 'all'}
          onValueChange={(value) => {
            if (value === 'all') {
              updateFilter('insurance', undefined);
            } else {
              updateFilter('insurance', [value as any]);
            }
          }}
        >
          <SelectTrigger id="insurance" className="min-h-[44px]">
            <SelectValue placeholder="Any insurance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any insurance</SelectItem>
            <SelectItem value="medicaid">Medicaid</SelectItem>
            <SelectItem value="medicare">Medicare</SelectItem>
            <SelectItem value="private">Private insurance</SelectItem>
            <SelectItem value="uninsured">No insurance needed</SelectItem>
            <SelectItem value="sliding_scale">Sliding scale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-700" />

      {/* Filter 4: Access Method */}
      <div className="space-y-3">
        <Label htmlFor="access" className="text-sm font-semibold text-gray-900 dark:text-white block">
          Access Method
        </Label>
        <Select
          value={
            filters.walk_ins_accepted
              ? 'walk-in'
              : filters.referral_required
              ? 'referral'
              : 'all'
          }
          onValueChange={(value) => {
            if (value === 'all') {
              updateFilter('walk_ins_accepted', undefined);
              updateFilter('referral_required', undefined);
            } else if (value === 'walk-in') {
              updateFilter('walk_ins_accepted', true);
              updateFilter('referral_required', undefined);
            } else if (value === 'referral') {
              updateFilter('walk_ins_accepted', undefined);
              updateFilter('referral_required', true);
            }
          }}
        >
          <SelectTrigger id="access" className="min-h-[44px]">
            <SelectValue placeholder="Any access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any access method</SelectItem>
            <SelectItem value="walk-in">Walk-in welcome</SelectItem>
            <SelectItem value="referral">Referral required</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <Card className="hidden lg:block p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-blue-700" />
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <FilterContent />
      </Card>

      {/* Mobile Filter Button + Sheet */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full gap-2 min-h-[48px] border-2 font-semibold relative"
              size="lg"
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-700 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                <SlidersHorizontal className="h-6 w-6 text-blue-700" />
                Filter Resources
              </SheetTitle>
              <SheetDescription>
                Refine your search to find the most relevant resources
              </SheetDescription>
            </SheetHeader>
            <FilterContent />
            <div className="mt-8 flex gap-3">
              <Button
                onClick={() => setOpen(false)}
                className="flex-1 min-h-[48px] bg-blue-700 hover:bg-blue-800"
                size="lg"
              >
                Apply Filters
              </Button>
              <Button
                onClick={() => {
                  // Reset all filters
                  onChange({
                    urgentAccessOnly: true,
                    max_distance_km: 50,
                    insurance: undefined,
                    walk_ins_accepted: undefined,
                    referral_required: undefined,
                  });
                }}
                variant="outline"
                className="min-h-[48px]"
                size="lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
