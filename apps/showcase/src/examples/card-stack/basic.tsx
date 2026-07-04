"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardStack,
  CardTitle,
} from "@dethink/components";

const releases = [
  {
    version: "v1.4.0",
    date: "June 2026",
    summary: "Date suite: Calendar, DatePicker, DateRangePicker, DateTimePicker.",
  },
  {
    version: "v1.3.0",
    date: "May 2026",
    summary: "DataTable with sorting, filtering, and row selection.",
  },
  {
    version: "v1.2.0",
    date: "April 2026",
    summary: "Overlay primitives: Popover, Tooltip, and DropdownMenu.",
  },
];

export function CardStackBasic() {
  return (
    <CardStack aria-label="Latest releases">
      {releases.map((release) => (
        <Card key={release.version}>
          <CardHeader>
            <CardTitle>{release.version}</CardTitle>
            <CardDescription>{release.date}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {release.summary}
          </CardContent>
        </Card>
      ))}
    </CardStack>
  );
}
