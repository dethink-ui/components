"use client";

import { RevealButton, type RevealButtonSize } from "@dethink/components";
import { Search } from "lucide-react";

const sizes: RevealButtonSize[] = ["xs", "sm", "md", "lg", "xl"];

export function RevealButtonSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {sizes.map((size) => (
        <RevealButton
          key={size}
          icon={<Search />}
          label={`${size.toUpperCase()} search`}
          size={size}
          variant="outline"
        />
      ))}
    </div>
  );
}
