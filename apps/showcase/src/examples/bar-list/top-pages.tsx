"use client";

import { BarList } from "@dethink/components";

const pages = [
  { label: "/", value: 12_940, href: "#home" },
  { label: "/pricing", value: 5_320, href: "#pricing" },
  { label: "/docs/getting-started", value: 4_870, href: "#docs" },
  {
    label: "/blog/launching-dethink-charts-without-a-chart-library",
    value: 2_310,
    href: "#blog",
  },
  { label: "/changelog", value: 1_420, href: "#changelog" },
  { label: "/careers", value: 640, href: "#careers" },
  { label: "/legal/privacy", value: 210, href: "#privacy" },
];

export function BarListTopPages() {
  return (
    <div className="w-full max-w-xl">
      <h3 id="top-pages-heading" className="mb-3 text-sm font-medium">
        Top pages
      </h3>
      <BarList
        aria-labelledby="top-pages-heading"
        data={pages}
        labelHeader="Page"
        valueHeader="Visitors"
        limit={5}
      />
    </div>
  );
}
