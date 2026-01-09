import * as React from "react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

export interface BadgeGroupProps {
  title: string;
  items: string[];
  colorScheme?: "blue" | "purple" | "green" | "amber";
  icon?: React.ReactNode;
  showCount?: boolean;
  maxDisplay?: number;
  className?: string;
}

const colorSchemeClasses = {
  blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  green: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  amber: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
};

/**
 * BadgeGroup component for displaying collections of related badges.
 *
 * Color scheme guide:
 * - blue: Service categories
 * - purple: Specialized programs
 * - green: Evidence-based practices, insurance
 * - amber: Accreditations
 */
export function BadgeGroup({
  title,
  items,
  colorScheme = "blue",
  icon,
  showCount = false,
  maxDisplay,
  className,
}: BadgeGroupProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const displayItems = maxDisplay ? items.slice(0, maxDisplay) : items;
  const remainingCount = maxDisplay && items.length > maxDisplay ? items.length - maxDisplay : 0;
  const colorClasses = colorSchemeClasses[colorScheme];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        {icon && <div className="text-gray-500 dark:text-gray-400">{icon}</div>}
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
          {showCount && <span className="ml-1.5 text-gray-500">({items.length})</span>}
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {displayItems.map((item, index) => (
          <Badge
            key={`${item}-${index}`}
            variant="outline"
            className={cn("border", colorClasses)}
          >
            {item}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge
            variant="outline"
            className="border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
          >
            +{remainingCount} more
          </Badge>
        )}
      </div>
    </div>
  );
}
