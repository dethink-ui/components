"use client";

import { useState } from "react";
import { Button, DateRangePicker } from "@dethink/components";

export function DateRangePickerForm() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <form
      className="mx-auto max-w-sm space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(
          `checkIn=${data.get("checkIn")} checkOut=${data.get("checkOut")}`,
        );
      }}
    >
      <DateRangePicker
        label="Stay"
        startName="checkIn"
        endName="checkOut"
        required
      />
      <Button type="submit" size="sm">
        Book
      </Button>
      {submitted ? (
        <p className="text-muted-foreground font-mono text-xs">{submitted}</p>
      ) : null}
    </form>
  );
}
