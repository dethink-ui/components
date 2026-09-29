"use client";

import { BarList } from "@dethink/components";

const countries = [
  { label: "United States", value: 48_210, icon: "🇺🇸" },
  { label: "Germany", value: 21_430, icon: "🇩🇪" },
  { label: "India", value: 19_880, icon: "🇮🇳" },
  { label: "United Kingdom", value: 14_050, icon: "🇬🇧" },
  { label: "Brazil", value: 9_310, icon: "🇧🇷" },
];

export function BarListCountries() {
  return (
    <div className="grid w-full gap-8 sm:grid-cols-2">
      <BarList
        aria-label="Revenue by country"
        data={countries}
        color="chart-6"
        formatOptions={{ style: "currency", currency: "USD" }}
        labelHeader="Country"
        valueHeader="Revenue"
      />
      <BarList
        aria-label="Revenue by country, ascending"
        data={countries}
        color="chart-7"
        sort="ascending"
        formatOptions={{ style: "currency", currency: "USD" }}
        labelHeader="Country"
        valueHeader="Revenue"
      />
    </div>
  );
}
