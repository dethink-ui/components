"use client";

import { Select, SelectItem } from "../select";
import { cn } from "../../utils/cn";
import type { ChatModel } from "./types";
export interface ModelPickerProps {
  models: readonly ChatModel[];
  value?: string;
  onValueChange: (id: string) => void;
  disabled?: boolean;
  className?: string;
}
export function ModelPicker({
  models,
  value,
  onValueChange,
  disabled,
  className,
}: ModelPickerProps) {
  return (
    <Select
      aria-label="Model"
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      controlSize="sm"
      data-slot="model-picker"
      className={cn(
        "[&_[data-slot=select-trigger][data-hovered]]:bg-muted w-fit max-w-full [&_[data-slot=select-icon]]:ms-0 [&_[data-slot=select-icon]]:size-3 [&_[data-slot=select-trigger]]:h-7 [&_[data-slot=select-trigger]]:gap-1.5 [&_[data-slot=select-trigger]]:rounded-lg [&_[data-slot=select-trigger]]:border-transparent [&_[data-slot=select-trigger]]:bg-transparent [&_[data-slot=select-trigger]]:px-2 [&_[data-slot=select-trigger]]:text-xs [&_[data-slot=select-trigger]]:shadow-none",
        className,
      )}
      placeholder="Choose model"
    >
      {models.map((model) => (
        <SelectItem
          key={model.id}
          value={model.id}
          textValue={model.name}
          disabled={!!model.disabledReason}
          className="group/model-option"
        >
          <span className="block text-sm font-medium">{model.name}</span>
          {(model.disabledReason || model.description) && (
            <span className="text-muted-foreground group-data-[selected]/model-option:text-primary-foreground block text-xs">
              {model.disabledReason || model.description}
            </span>
          )}
        </SelectItem>
      ))}
    </Select>
  );
}
