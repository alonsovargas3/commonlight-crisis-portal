import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  type LucideIcon,
} from "lucide-react";

export type ProgressStatus = "pending" | "processing" | "completed" | "failed";

interface ProgressSubstep {
  label: string;
  status: "pending" | "processing" | "completed" | "failed";
}

interface ProgressIndicatorProps {
  status: ProgressStatus;
  progress?: number; // 0-100
  message: string;
  substeps?: ProgressSubstep[];
  estimatedTime?: string; // e.g., "~2 minutes remaining"
  className?: string;
  compact?: boolean;
}

const statusConfig: Record<
  ProgressStatus,
  {
    icon: LucideIcon;
    label: string;
    badgeClass: string;
    iconColor: string;
  }
> = {
  pending: {
    icon: Clock,
    label: "Pending",
    badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    iconColor: "text-gray-500 dark:text-gray-400",
  },
  processing: {
    icon: Loader2,
    label: "Processing",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  completed: {
    icon: CheckCircle,
    label: "Completed",
    badgeClass:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    iconColor: "text-green-600 dark:text-green-400",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    iconColor: "text-red-600 dark:text-red-400",
  },
};

export function ProgressIndicator({
  status,
  progress = 0,
  message,
  substeps,
  estimatedTime,
  className,
  compact = false,
}: ProgressIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const showProgressBar = status === "processing" && progress > 0;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 border rounded-lg",
          "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
          className
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5 shrink-0",
            config.iconColor,
            status === "processing" && "animate-spin"
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={cn("shrink-0", config.badgeClass)}>
              {config.label}
            </Badge>
            <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
              {message}
            </p>
          </div>
          {showProgressBar && (
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Icon
            className={cn(
              "w-6 h-6 shrink-0 mt-0.5",
              config.iconColor,
              status === "processing" && "animate-spin"
            )}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={config.badgeClass}>
                {config.label}
              </Badge>
              {estimatedTime && status === "processing" && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {estimatedTime}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {message}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgressBar && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Progress
              </span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Substeps */}
        {substeps && substeps.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Steps
            </p>
            {substeps.map((substep, index) => {
              const substepConfig = statusConfig[substep.status];
              const SubstepIcon = substepConfig.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm pl-2"
                >
                  <SubstepIcon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      substepConfig.iconColor,
                      substep.status === "processing" && "animate-spin"
                    )}
                  />
                  <span
                    className={cn(
                      substep.status === "completed"
                        ? "text-gray-500 dark:text-gray-400 line-through"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {substep.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
