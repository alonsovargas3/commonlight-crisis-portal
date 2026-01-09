"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { MapPin, HelpCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationSelector } from "./LocationSelector";

/**
 * Crisis Portal Top Bar
 *
 * Simple, focused top bar with:
 * - CommonLight logo
 * - Location selector (always visible)
 * - Trust indicator
 * - Help/Support button
 * - User profile
 *
 * Mobile optimizations:
 * - Larger touch targets (min 44px)
 * - Simplified layout for small screens
 * - Collapsible elements
 */
export function CrisisTopBar() {
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
      role="banner"
    >
      <div className="container mx-auto px-4 h-16 sm:h-18 flex items-center justify-between gap-3">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/crisis"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity min-h-[44px]"
            aria-label="CommonLight home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-700 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 hidden md:inline">
              CommonLight
            </span>
          </a>
        </div>

        {/* Center: Location Selector */}
        <div className="flex-1 max-w-sm lg:max-w-md">
          <LocationSelector />
        </div>

        {/* Right: Trust Indicator, Help and Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Trust Indicator - Desktop only */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-300">
              Verified Data
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-gray-600 dark:text-gray-400 min-h-[44px] min-w-[44px]"
            aria-label="Help and support"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="hidden xl:inline">Help</span>
          </Button>

          <div className="min-h-[44px] flex items-center">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 sm:h-10 sm:w-10"
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Trust Indicator Bar */}
      <div className="lg:hidden bg-green-50 dark:bg-green-950/30 border-t border-green-200 dark:border-green-800">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          <span className="text-xs font-semibold text-green-700 dark:text-green-300">
            All resources verified daily
          </span>
        </div>
      </div>
    </header>
  );
}
