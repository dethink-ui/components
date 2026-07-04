"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectItem,
} from "@dethink/components";

/**
 * The library's density contract is a plain `data-density` attribute, so a
 * Select can retheme an entire subtree live — no component changes needed.
 */
export function SelectRecipeDensity() {
  const [density, setDensity] = useState("default");

  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-xs">
        <Select
          label="Interface density"
          value={density}
          onValueChange={(value) => setDensity(value)}
        >
          <SelectItem value="compact">Compact</SelectItem>
          <SelectItem value="default">Default</SelectItem>
          <SelectItem value="comfortable">Comfortable</SelectItem>
        </Select>
      </div>
      <div data-density={density}>
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle>Invite teammate</CardTitle>
            <CardDescription>
              Everything below respacing is driven by one attribute.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="density-invite-email" className="text-sm font-medium">
                Email
              </label>
              <Input id="density-invite-email" placeholder="teammate@company.com" />
            </div>
          </CardContent>
          <CardFooter justify="end">
            <Button variant="ghost">Cancel</Button>
            <Button>Send invite</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
