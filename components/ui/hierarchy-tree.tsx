"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Building2, MapPin, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HierarchyNode {
  id: string;
  name: string;
  display_name?: string;
  facility_type?: string;
  hierarchy_level: number;
  child_facility_count?: number;
  city?: string;
  state?: string;
  services?: Array<{ id: string; name: string }>;
  children?: HierarchyNode[];
}

interface HierarchyTreeProps {
  nodes: HierarchyNode[];
  className?: string;
  onReanalyze?: (facilityId: string) => void;
  reanalyzingSet?: Set<string>;
}

interface TreeNodeProps {
  node: HierarchyNode;
  level?: number;
  onReanalyze?: (facilityId: string) => void;
  reanalyzingSet?: Set<string>;
}

function TreeNode({ node, level = 0, onReanalyze, reanalyzingSet }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = node.children && node.children.length > 0;
  const indentWidth = level * 24; // 24px per level
  const isReanalyzing = reanalyzingSet?.has(node.id) || false;

  return (
    <div>
      {/* Node Row */}
      <div
        className={cn(
          "group relative flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors",
          level === 0 && "bg-muted/30"
        )}
        style={{ paddingLeft: `${indentWidth + 12}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-muted"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}

        {/* Spacer for nodes without children */}
        {!hasChildren && <div className="w-5" />}

        {/* Facility Icon */}
        <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />

        {/* Facility Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/resources/${node.id}`}
            className="block hover:underline font-medium text-sm truncate"
          >
            {node.display_name || node.name}
          </Link>

          {/* Location and Service Count */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {node.city && node.state && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {node.city}, {node.state}
              </div>
            )}

            {node.facility_type && (
              <Badge variant="outline" className="text-xs">
                {node.facility_type}
              </Badge>
            )}

            {node.services && node.services.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {node.services.length} {node.services.length === 1 ? "service" : "services"}
              </Badge>
            )}

            {hasChildren && (
              <Badge variant="secondary" className="text-xs">
                {node.child_facility_count || node.children!.length} {node.child_facility_count === 1 ? "facility" : "facilities"}
              </Badge>
            )}
          </div>
        </div>

        {/* Hierarchy Level Badge */}
        {level > 0 && (
          <Badge variant="outline" className="text-xs flex-shrink-0">
            Level {node.hierarchy_level}
          </Badge>
        )}

        {/* Re-Analyze Button */}
        {onReanalyze && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReanalyze(node.id);
            }}
            disabled={isReanalyzing}
            className="h-7 px-2 text-xs flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <RefreshCcw className={`w-3 h-3 mr-1 ${isReanalyzing ? "animate-spin" : ""}`} />
            {isReanalyzing ? "Queued" : "Re-Analyze"}
          </Button>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Vertical Line for Tree Structure */}
          <div
            className="absolute top-0 bottom-0 w-px bg-border"
            style={{ left: `${indentWidth + 12 + 12}px` }}
          />

          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onReanalyze={onReanalyze}
              reanalyzingSet={reanalyzingSet}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HierarchyTree({ nodes, className, onReanalyze, reanalyzingSet }: HierarchyTreeProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No facilities in hierarchy</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          onReanalyze={onReanalyze}
          reanalyzingSet={reanalyzingSet}
        />
      ))}
    </div>
  );
}
