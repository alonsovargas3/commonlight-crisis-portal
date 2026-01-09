import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlagItem {
  label: string;
  value: boolean;
  highlightWhenTrue?: boolean;
}

export interface FlagGridProps {
  flags: FlagItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}

/**
 * FlagGrid component for displaying boolean flags with visual indicators.
 *
 * WCAG-compliant with both color and icon indicators.
 */
export function FlagGrid({ flags, columns = 2, className }: FlagGridProps) {
  if (!flags || flags.length === 0) {
    return null;
  }

  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  }[columns];

  return (
    <div className={cn("grid gap-3", gridColsClass, className)}>
      {flags.map((flag, index) => {
        const isHighlighted = flag.highlightWhenTrue && flag.value;

        return (
          <div
            key={`${flag.label}-${index}`}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
              flag.value
                ? isHighlighted
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                : "bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800"
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                flag.value
                  ? isHighlighted
                    ? "bg-green-500 dark:bg-green-600"
                    : "bg-blue-500 dark:bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-700"
              )}
              aria-hidden="true"
            >
              {flag.value ? (
                <Check className="w-3 h-3 text-white" />
              ) : (
                <X className="w-3 h-3 text-white opacity-50" />
              )}
            </div>
            <span
              className={cn(
                "font-medium",
                flag.value
                  ? isHighlighted
                    ? "text-green-900 dark:text-green-100"
                    : "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-500"
              )}
            >
              {flag.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
