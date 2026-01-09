"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Globe,
  Navigation,
  Copy,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";

interface Resource {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  city?: string;
  state?: string;
  phone_numbers?: string[];
  website?: string;
  distance_km?: number;
  services?: Array<{
    name: string;
    service_type?: string;
  }>;
  provenance?: {
    last_verified_at?: string;
    rcs?: number;
  };
  avg_rcs?: number;
}

interface CrisisResourceCardProps {
  resource: Resource;
  userLocation?: { lat: number; lng: number };
  index?: number;
}

/**
 * Crisis Resource Card
 *
 * Action-oriented card focused on immediate usability:
 * - Call/Directions/Website/Copy buttons (prominent)
 * - Trust indicators (verification, confidence)
 * - Essential info only (name, location, services)
 */
export function CrisisResourceCard({ resource, userLocation, index }: CrisisResourceCardProps) {
  const [copied, setCopied] = useState(false);

  const displayName = resource.display_name || resource.name;
  const location = [resource.city, resource.state].filter(Boolean).join(', ');
  const phoneNumber = resource.phone_numbers?.[0];
  const website = resource.website;
  const rcs = resource.provenance?.rcs || resource.avg_rcs || 0;
  const lastVerified = resource.provenance?.last_verified_at;

  // Calculate days since verification
  const daysSinceVerification = lastVerified
    ? Math.floor((Date.now() - new Date(lastVerified).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Trust level based on RCS
  const getTrustLevel = (score: number) => {
    if (score >= 0.85) return { label: 'Verified', color: 'text-green-600', icon: CheckCircle2 };
    if (score >= 0.7) return { label: 'Good Confidence', color: 'text-blue-600', icon: CheckCircle2 };
    return { label: 'Low Confidence', color: 'text-yellow-600', icon: AlertCircle };
  };

  const trustLevel = getTrustLevel(rcs);
  const TrustIcon = trustLevel.icon;

  // Format distance
  const distanceText = resource.distance_km !== undefined
    ? resource.distance_km < 1
      ? `${Math.round(resource.distance_km * 1000)}m`
      : `${resource.distance_km.toFixed(1)}km`
    : null;

  // Action handlers
  const handleCall = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleDirections = () => {
    const query = encodeURIComponent(`${displayName}, ${location}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleWebsite = () => {
    if (website) {
      window.open(website, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopy = () => {
    const summary = [
      `${displayName}`,
      location && `Location: ${location}`,
      phoneNumber && `Phone: ${phoneNumber}`,
      website && `Website: ${website}`,
      resource.services?.[0] && `Service: ${resource.services[0].name}`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-5 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 bg-white dark:bg-gray-900">
      <div className="space-y-4">
        {/* Header: Name + Trust Indicator */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link
              href={`/crisis/resource/${resource.id}`}
              className="group flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                {displayName}
              </h3>
              <ChevronRight className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            {resource.services && resource.services.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {resource.services[0].name}
              </p>
            )}
          </div>

          {/* Trust Badge */}
          <div className={`flex items-center gap-1.5 text-xs font-medium ${trustLevel.color} shrink-0`}>
            <TrustIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{trustLevel.label}</span>
          </div>
        </div>

        {/* Location + Distance */}
        {location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{location}</span>
            {distanceText && (
              <>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {distanceText}
                </span>
              </>
            )}
          </div>
        )}

        {/* Verification Info */}
        {daysSinceVerification !== null && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>Verified {daysSinceVerification} days ago</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleCall}
            disabled={!phoneNumber}
            className="gap-2"
            aria-label={phoneNumber ? `Call ${phoneNumber}` : 'No phone number available'}
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Call</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDirections}
            className="gap-2"
            aria-label={`Get directions to ${displayName}`}
          >
            <Navigation className="h-4 w-4" />
            <span className="hidden sm:inline">Directions</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleWebsite}
            disabled={!website}
            className="gap-2"
            aria-label={website ? `Visit website for ${displayName}` : 'No website available'}
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Website</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
            aria-label={`Copy ${displayName} information to clipboard`}
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
