"use client"

import * as React from "react"
import { Check, ChevronDown, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

export interface MultiSelectOption {
  label: string
  value: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  const selectedCount = selected.length
  const hasSelection = selectedCount > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            hasSelection && "border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-600",
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasSelection && (
              <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            )}
            <span className="truncate">
              {hasSelection
                ? `${selectedCount} selected`
                : placeholder}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {hasSelection && (
              <X
                className="h-4 w-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                onClick={handleClear}
              />
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-white dark:bg-slate-900"
        align="start"
        sideOffset={4}
      >
        <div className="max-h-[300px] overflow-auto p-1 bg-white dark:bg-slate-900">
          {options.map((option) => {
            const isSelected = selected.includes(option.value)
            return (
              <div
                key={option.value}
                className={cn(
                  "flex items-center space-x-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800",
                  isSelected && "bg-slate-50 dark:bg-slate-900"
                )}
                onClick={() => handleSelect(option.value)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleSelect(option.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <label
                  className="text-sm font-normal cursor-pointer flex-1"
                  onClick={(e) => e.preventDefault()}
                >
                  {option.label}
                </label>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
