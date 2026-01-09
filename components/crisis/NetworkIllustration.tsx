"use client";

import { useEffect, useState } from "react";

/**
 * Network Illustration Component
 *
 * Animated community network visualization for the hero section.
 * Shows interconnected nodes representing resources and people.
 * Inspired by FindHelp.org's community illustration.
 */
export function NetworkIllustration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full h-[400px] lg:h-[500px]">
      {/* Main SVG Container */}
      <svg
        viewBox="0 0 600 500"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="nodeGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891A6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="nodeGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="nodeGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.6" />
          </linearGradient>

          {/* Glow filters */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection Lines */}
        <g opacity="0.3" stroke="#0891A6" strokeWidth="2" fill="none">
          <line x1="300" y1="250" x2="150" y2="150">
            <animate
              attributeName="stroke-opacity"
              values="0.2;0.6;0.2"
              dur="3s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="300" y1="250" x2="450" y2="150">
            <animate
              attributeName="stroke-opacity"
              values="0.2;0.6;0.2"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="300" y1="250" x2="200" y2="350">
            <animate
              attributeName="stroke-opacity"
              values="0.2;0.6;0.2"
              dur="4s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="300" y1="250" x2="400" y2="350">
            <animate
              attributeName="stroke-opacity"
              values="0.2;0.6;0.2"
              dur="3.2s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="150" y1="150" x2="450" y2="150">
            <animate
              attributeName="stroke-opacity"
              values="0.1;0.4;0.1"
              dur="5s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="200" y1="350" x2="400" y2="350">
            <animate
              attributeName="stroke-opacity"
              values="0.1;0.4;0.1"
              dur="4.5s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="150" y1="150" x2="200" y2="350">
            <animate
              attributeName="stroke-opacity"
              values="0.1;0.3;0.1"
              dur="4.8s"
              repeatCount="indefinite"
            />
          </line>
          <line x1="450" y1="150" x2="400" y2="350">
            <animate
              attributeName="stroke-opacity"
              values="0.1;0.3;0.1"
              dur="5.2s"
              repeatCount="indefinite"
            />
          </line>
        </g>

        {/* Outer Ring Nodes - Small */}
        <g>
          {/* Top Left */}
          <circle cx="100" cy="100" r="12" fill="url(#nodeGradient3)" filter="url(#glow)" opacity={mounted ? "1" : "0"}>
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="0.5s"
              begin="0.1s"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values="12;14;12"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Top Right */}
          <circle cx="500" cy="100" r="14" fill="url(#nodeGradient2)" filter="url(#glow)" opacity={mounted ? "1" : "0"}>
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="0.5s"
              begin="0.2s"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values="14;16;14"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Bottom Left */}
          <circle cx="120" cy="400" r="10" fill="url(#nodeGradient1)" filter="url(#glow)" opacity={mounted ? "1" : "0"}>
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="0.5s"
              begin="0.3s"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values="10;12;10"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Bottom Right */}
          <circle cx="480" cy="400" r="13" fill="url(#nodeGradient3)" filter="url(#glow)" opacity={mounted ? "1" : "0"}>
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="0.5s"
              begin="0.4s"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values="13;15;13"
              dur="2.8s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Inner Ring Nodes - Medium */}
        <g>
          {/* Top Left */}
          <circle cx="150" cy="150" r="18" fill="url(#nodeGradient1)" filter="url(#glow)" opacity={mounted ? "1" : "0"}>
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="0.6s"
              begin="0.5s"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values="18;20;18"
              dur="2.2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Top Right */}
          <circle cx="450" cy="150" r="20" fill="url(#nodeGradient2)" filter="url(#glow)" opacity={mounted ? "1" : "0"}>
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="0.6s"
              begin="0.6s"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values="20;22;20"
              dur="2.6s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Bottom Left */}
          <circle cx="200" cy="350" r="16" fill="url(#nodeGradient3)" filter="url(#glow)" opacity={mounted ? "1" : "0"}>
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="0.6s"
              begin="0.7s"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values="16;18;16"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Bottom Right */}
          <circle cx="400" cy="350" r="19" fill="url(#nodeGradient1)" filter="url(#glow)" opacity={mounted ? "1" : "0"}>
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="0.6s"
              begin="0.8s"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values="19;21;19"
              dur="2.7s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Center Node - Large (represents the main hub/platform) */}
        <g>
          <circle
            cx="300"
            cy="250"
            r="45"
            fill="url(#nodeGradient1)"
            filter="url(#glow)"
            opacity={mounted ? "1" : "0"}
          >
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="0.8s"
              begin="0.9s"
              fill="freeze"
            />
            <animate
              attributeName="r"
              values="45;48;45"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Center icon (simplified heart for health/care) */}
          <path
            d="M300 235 L305 228 Q312 220 315 228 L315 232 Q315 240 300 250 Q285 240 285 232 L285 228 Q288 220 295 228 Z"
            fill="white"
            opacity={mounted ? "0.9" : "0"}
          >
            <animate
              attributeName="opacity"
              from="0"
              to="0.9"
              dur="0.5s"
              begin="1.2s"
              fill="freeze"
            />
          </path>
        </g>

        {/* Floating particles for depth */}
        <g opacity="0.4">
          <circle cx="250" cy="180" r="3" fill="#0891A6">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 10 -10; 0 0"
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.2;0.6;0.2"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="350" cy="200" r="2" fill="#7C3AED">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; -8 8; 0 0"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.2;0.5;0.2"
              dur="5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="320" cy="300" r="2.5" fill="#0284C7">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0; 5 15; 0 0"
              dur="6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.2;0.4;0.2"
              dur="6s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>

      {/* Decorative elements around the SVG */}
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-teal-200/20 dark:bg-teal-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -top-4 -left-4 w-40 h-40 bg-blue-200/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
    </div>
  );
}
