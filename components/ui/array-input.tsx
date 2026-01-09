"use client";

import React, { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ArrayInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  isDirty?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ArrayInput({
  value = [],
  onChange,
  label,
  isDirty = false,
  placeholder = "Add item...",
  disabled = false,
}: ArrayInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {label}
        {isDirty && (
          <span className="h-2 w-2 rounded-full bg-blue-500" title="Modified" />
        )}
      </Label>

      {/* Display current values as dismissible badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
          {value.map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              <span>{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Input field for adding new values */}
      {!disabled && (
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            variant="outline"
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
