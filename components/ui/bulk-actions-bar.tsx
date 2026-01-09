import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface BulkAction {
  label: string;
  onClick: () => void | Promise<void>;
  icon?: LucideIcon;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
}

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll?: () => void;
  onClear: () => void;
  actions: BulkAction[];
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClear,
  actions,
  className,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <div
      className={cn(
        "sticky top-0 z-20 bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800",
        "px-6 py-3 flex items-center justify-between gap-4",
        "shadow-sm animate-in slide-in-from-top-2 duration-200",
        className
      )}
    >
      {/* Selection Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedCount} of {totalCount} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 px-2 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>

        {onSelectAll && !allSelected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="h-7 px-2 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
          >
            Select All ({totalCount})
          </Button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isLoading = action.loading;
          const isDisabled = action.disabled || isLoading;

          return (
            <Button
              key={index}
              variant={action.variant || "default"}
              size="sm"
              onClick={action.onClick}
              disabled={isDisabled}
              className="h-8"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : Icon ? (
                <Icon className="w-4 h-4 mr-2" />
              ) : null}
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
