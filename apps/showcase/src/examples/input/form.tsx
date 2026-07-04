"use client";

import { useState } from "react";
import { Button, Input } from "@dethink/components";

export function InputForm() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <form
      className="flex w-full max-w-md items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        setSubscribed(true);
      }}
    >
      <div className="flex-1 space-y-1.5">
        <label htmlFor="newsletter-email" className="text-sm font-medium">
          Get release notes
        </label>
        <Input
          id="newsletter-email"
          type="email"
          required
          placeholder="you@company.com"
        />
      </div>
      <Button type="submit" variant={subscribed ? "soft" : "solid"}>
        {subscribed ? "Subscribed ✓" : "Subscribe"}
      </Button>
    </form>
  );
}
