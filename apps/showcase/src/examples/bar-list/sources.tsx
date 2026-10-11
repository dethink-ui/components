"use client";

import { BarList, type BarListItem } from "@dethink/components";
import { Globe, Mail, MessageCircle, Search } from "lucide-react";
import { useState } from "react";

const sources: BarListItem[] = [
  { key: "search", label: "Organic search", value: 0.412, icon: <Search /> },
  { key: "direct", label: "Direct", value: 0.268, icon: <Globe /> },
  { key: "social", label: "Social", value: 0.174, icon: <MessageCircle /> },
  { key: "email", label: "Email", value: 0.146, icon: <Mail /> },
];

export function BarListSources() {
  const [selected, setSelected] = useState("search");

  return (
    <div className="grid w-full max-w-xl gap-4">
      <BarList
        aria-label="Traffic by source"
        data={sources.map((item) => ({
          ...item,
          color: item.key === selected ? "chart-3" : undefined,
        }))}
        color="chart-1"
        max={1}
        formatValue={(value) => `${(value * 100).toFixed(1)}%`}
        onItemClick={(item) => setSelected(item.key!)}
        size="sm"
      />
      <p className="text-muted-foreground text-xs" aria-live="polite">
        Filtering by{" "}
        <span className="text-foreground font-medium">
          {sources.find((item) => item.key === selected)?.label}
        </span>
        . Bars share a 0–100% scale.
      </p>
    </div>
  );
}
