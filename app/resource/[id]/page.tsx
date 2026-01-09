"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Globe,
  Navigation,
  Copy,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Mail,
  Loader2,
  ChevronDown,
  ChevronUp,
  Heart,
  Users,
  ShieldCheck,
  Calendar,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Resource {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  city?: string;
  state?: string;
  street_address?: string;
  postal_code?: string;
  phone_numbers?: string[];
  website?: string;
  email?: string;
  distance_km?: number;
  services?: Array<{
    name: string;
    service_type?: string;
    description?: string;
  }>;
  provenance?: {
    last_verified_at?: string;
    rcs?: number;
  };
  avg_rcs?: number;
  hours_text?: string;
}

/**
 * Crisis Resource Detail Page
 *
 * Psychology Today-inspired design with:
 * - Prominent contact information
 * - Progressive disclosure (collapsible sections)
 * - Clean card-based layout
 * - Sidebar with quick actions
 * - Professional, accessible design
 */
export default function CrisisResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    services: true,
    about: true,
    contact: true,
    location: false,
    verification: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch resource details
  useEffect(() => {
    async function fetchResource() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/resources/${resourceId}`);

        if (!response.ok) {
          throw new Error('Resource not found');
        }

        const data = await response.json();
        setResource(data);
      } catch (err) {
        console.error('Failed to fetch resource:', err);
        setError(err instanceof Error ? err.message : 'Failed to load resource');
      } finally {
        setIsLoading(false);
      }
    }

    if (resourceId) {
      fetchResource();
    }
  }, [resourceId]);

  // Action handlers
  const handleCall = () => {
    if (resource?.phone_numbers?.[0]) {
      window.location.href = `tel:${resource.phone_numbers[0]}`;
    }
  };

  const handleDirections = () => {
    if (resource) {
      const location = [resource.city, resource.state].filter(Boolean).join(', ');
      const query = encodeURIComponent(`${resource.display_name || resource.name}, ${location}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  const handleWebsite = () => {
    if (resource?.website) {
      window.open(resource.website, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopy = () => {
    if (!resource) return;

    const summary = [
      `${resource.display_name || resource.name}`,
      resource.description,
      `\nLocation: ${[resource.city, resource.state].filter(Boolean).join(', ')}`,
      resource.phone_numbers?.[0] && `Phone: ${resource.phone_numbers[0]}`,
      resource.website && `Website: ${resource.website}`,
      resource.email && `Email: ${resource.email}`,
      `\nServices:`,
      ...(resource.services || []).map(s => `- ${s.name}${s.description ? ': ' + s.description : ''}`),
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
          <span className="text-gray-600 dark:text-gray-400">Loading resource...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Resource not found'}
            </AlertDescription>
          </Alert>
          <Button onClick={handleBack} className="mt-4" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to search
          </Button>
        </div>
      </div>
    );
  }

  // Calculate trust level
  const rcs = resource.provenance?.rcs || resource.avg_rcs || 0;
  const getTrustLevel = (score: number) => {
    if (score >= 0.85) return { label: 'Verified', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800', icon: CheckCircle2 };
    if (score >= 0.7) return { label: 'Good Confidence', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800', icon: CheckCircle2 };
    return { label: 'Low Confidence', color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800', icon: AlertCircle };
  };

  const trustLevel = getTrustLevel(rcs);
  const TrustIcon = trustLevel.icon;

  // Calculate verification freshness
  const lastVerified = resource.provenance?.last_verified_at;
  const daysSinceVerification = lastVerified
    ? Math.floor((Date.now() - new Date(lastVerified).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const displayName = resource.display_name || resource.name;
  const location = [resource.city, resource.state].filter(Boolean).join(', ');
  const fullAddress = [resource.street_address, resource.city, resource.state, resource.postal_code].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header Bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button onClick={handleBack} variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left side */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header Card */}
            <Card className="p-6 sm:p-8 shadow-lg border-2">
              <div className="space-y-4">
                {/* Name and Trust Badge */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                      {displayName}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={`${trustLevel.color} border px-3 py-1 text-sm font-semibold`}>
                      <TrustIcon className="h-4 w-4 mr-1.5" />
                      {trustLevel.label}
                    </Badge>

                    {resource.services?.[0]?.service_type && (
                      <Badge variant="outline" className="px-3 py-1">
                        {resource.services[0].service_type}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Location */}
                {location && (
                  <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-blue-700" />
                    <div>
                      <p className="font-medium">{location}</p>
                      {resource.distance_km !== undefined && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {resource.distance_km < 1
                            ? `${Math.round(resource.distance_km * 1000)}m away`
                            : `${resource.distance_km.toFixed(1)}km away`}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Verification */}
                {daysSinceVerification !== null && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                    <Clock className="h-4 w-4" />
                    <span>Verified {daysSinceVerification} days ago</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Services Section */}
            {resource.services && resource.services.length > 0 && (
              <Collapsible open={openSections.services} onOpenChange={() => toggleSection('services')}>
                <Card className="overflow-hidden shadow-md">
                  <CollapsibleTrigger className="w-full p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Heart className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Services Offered
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {resource.services.length} service{resource.services.length !== 1 ? 's' : ''} available
                          </p>
                        </div>
                      </div>
                      {openSections.services ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6 space-y-3">
                      {resource.services.map((service, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {service.name}
                              </h3>
                              {service.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {service.description}
                                </p>
                              )}
                            </div>
                            {service.service_type && (
                              <Badge variant="secondary" className="shrink-0">
                                {service.service_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* About Section */}
            {resource.description && (
              <Collapsible open={openSections.about} onOpenChange={() => toggleSection('about')}>
                <Card className="overflow-hidden shadow-md">
                  <CollapsibleTrigger className="w-full p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-left">
                          About This Resource
                        </h2>
                      </div>
                      {openSections.about ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* Location Details */}
            <Collapsible open={openSections.location} onOpenChange={() => toggleSection('location')}>
              <Card className="overflow-hidden shadow-md">
                <CollapsibleTrigger className="w-full p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                        <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white text-left">
                        Location & Hours
                      </h2>
                    </div>
                    {openSections.location ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6 space-y-4">
                    {fullAddress && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Address
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">{fullAddress}</p>
                      </div>
                    )}

                    {resource.hours_text && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Hours
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">{resource.hours_text}</p>
                      </div>
                    )}

                    <Button
                      onClick={handleDirections}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </Button>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Verification Details */}
            <Collapsible open={openSections.verification} onOpenChange={() => toggleSection('verification')}>
              <Card className="overflow-hidden shadow-md">
                <CollapsibleTrigger className="w-full p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white text-left">
                        Verification Details
                      </h2>
                    </div>
                    {openSections.verification ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confidence Score
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {(rcs * 100).toFixed(0)}%
                      </span>
                    </div>

                    {lastVerified && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Last Verified
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {new Date(lastVerified).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Our team verifies resource information daily to ensure accuracy. This includes checking availability, services, and contact information.
                    </p>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          {/* Sidebar - Right side */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Contact Card */}
              <Card className="p-6 shadow-lg border-2 border-blue-100 dark:border-blue-900 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-700" />
                  Let's Connect
                </h3>

                <div className="space-y-3">
                  {resource.phone_numbers?.[0] && (
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                      <a
                        href={`tel:${resource.phone_numbers[0]}`}
                        className="text-lg font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        {resource.phone_numbers[0]}
                      </a>
                    </div>
                  )}

                  <Button
                    onClick={handleCall}
                    disabled={!resource.phone_numbers?.[0]}
                    className="w-full gap-2 h-12 text-base font-semibold bg-blue-700 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800"
                    size="lg"
                  >
                    <Phone className="h-5 w-5" />
                    Call Now
                  </Button>

                  {resource.website && (
                    <Button
                      onClick={handleWebsite}
                      variant="outline"
                      className="w-full gap-2 h-12 border-2"
                      size="lg"
                    >
                      <Globe className="h-5 w-5" />
                      Visit Website
                    </Button>
                  )}

                  {resource.email && (
                    <Button
                      onClick={() => window.location.href = `mailto:${resource.email}`}
                      variant="outline"
                      className="w-full gap-2 h-12 border-2"
                      size="lg"
                    >
                      <Mail className="h-5 w-5" />
                      Email
                    </Button>
                  )}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-4 shadow-md">
                <div className="space-y-2">
                  <Button
                    onClick={handleCopy}
                    variant="ghost"
                    className="w-full justify-start gap-2 h-10"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Copied to clipboard!' : 'Copy details'}
                  </Button>

                  <Button
                    onClick={handleDirections}
                    variant="ghost"
                    className="w-full justify-start gap-2 h-10"
                  >
                    <Navigation className="h-4 w-4" />
                    Get directions
                  </Button>
                </div>
              </Card>

              {/* Note */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
                Always call ahead to confirm availability and services
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
