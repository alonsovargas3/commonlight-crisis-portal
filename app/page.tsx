"use client";

import { useState } from "react";
import { Search, MapPin, Heart, Home, Phone, Users, Briefcase, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/components/crisis/LocationSelector";
import { NetworkIllustration } from "@/components/crisis/NetworkIllustration";

/**
 * Crisis Worker Portal Landing Page
 *
 * FindHelp.org-inspired design with:
 * - Clean hero section
 * - Large search input
 * - Category quick-access
 * - Trust indicators
 * - Professional, calming aesthetic
 */

const CATEGORIES = [
  { icon: Heart, label: "Health", color: "#1D4ED8" },
  { icon: Phone, label: "Crisis", color: "#DC2626" },
  { icon: Home, label: "Housing", color: "#7C3AED" },
  { icon: Users, label: "Care", color: "#EA580C" },
  { icon: Briefcase, label: "Work", color: "#0284C7" },
  { icon: Scale, label: "Legal", color: "#4338CA" },
];

export default function CrisisLandingPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      // Smooth scroll to top to show location selector
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!query.trim()) {
      return;
    }

    setIsSearching(true);
    const encodedQuery = encodeURIComponent(query);
    window.location.href = `/crisis/search?q=${encodedQuery}`;
  };

  const handleCategoryClick = (category: string) => {
    setQuery(`${category} services near me`);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230891A6' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative container mx-auto px-4 py-12 sm:py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <div className="space-y-8 lg:space-y-10">
              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white tracking-tight">
                  <span className="block">Help is available</span>
                  <span className="block text-blue-700 dark:text-blue-400">in your community</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
                  Connect people to mental health resources, crisis support, housing, and more. Real-time verified information for frontline workers.
                </p>
              </div>

              {/* Search Input */}
              <div className="space-y-3">
                <form onSubmit={handleSearch} className="space-y-3">
                  {/* Location Display/Prompt */}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MapPin className="h-4 w-4 text-blue-700" />
                    {location ? (
                      <span>{location.displayName}</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">
                        ⬆ Select a location above to start searching
                      </span>
                    )}
                  </div>

                  {/* Search Bar */}
                  <div className="relative group">
                    <Input
                      type="text"
                      placeholder="Describe what you need in plain language..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-16 sm:h-20 px-6 pr-32 text-base sm:text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg focus:border-blue-700 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all duration-200 bg-white dark:bg-gray-900"
                      aria-label="Search for resources"
                      disabled={!location}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!location || !query.trim() || isSearching}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-12 sm:h-14 px-6 sm:px-8 bg-blue-700 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold rounded-lg shadow-md transition-all duration-200 hover:shadow-xl disabled:opacity-50"
                    >
                      {isSearching ? (
                        <span className="animate-pulse">Searching...</span>
                      ) : (
                        <>
                          <Search className="h-5 w-5 sm:mr-2" />
                          <span className="hidden sm:inline">Search</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Trust Badge */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ShieldCheck className="h-4 w-4 text-blue-700" />
                  <span>
                    <strong className="font-semibold text-blue-700 dark:text-blue-400">Verified resources</strong>
                    {" "}• Updated daily by our team
                  </span>
                </div>
              </div>

              {/* Example Searches */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Quick Examples:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Crisis support for suicidal thoughts",
                    "Inpatient mental health treatment",
                    "24/7 crisis hotline",
                    "Emergency domestic violence shelter",
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(example)}
                      className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors duration-200 text-gray-700 dark:text-gray-300"
                      type="button"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Illustration */}
            <div className="hidden lg:block">
              <NetworkIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Category Bar */}
      <section className="bg-blue-700 dark:bg-blue-900 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4 overflow-x-auto scrollbar-hide">
            <p className="text-white font-semibold text-sm uppercase tracking-wide whitespace-nowrap hidden sm:block">
              Browse by category:
            </p>
            <div className="flex items-center gap-3 sm:gap-6">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.label}
                    onClick={() => handleCategoryClick(category.label)}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200 group min-w-[80px]"
                    aria-label={`Browse ${category.label} resources`}
                  >
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white whitespace-nowrap">
                      {category.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
