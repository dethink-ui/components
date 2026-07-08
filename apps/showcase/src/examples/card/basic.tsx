"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@dethink/components";

export function CardBasic() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Usage this month</CardTitle>
        <CardDescription>
          Track how your workspace is consuming its plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-3xl font-semibold">
          12,480{" "}
          <span className="text-muted-foreground text-sm font-normal">
            / 20,000 requests
          </span>
        </p>
      </CardContent>
      <CardFooter justify="end">
        <Button variant="ghost">Dismiss</Button>
        <Button variant="soft">Upgrade plan</Button>
      </CardFooter>
    </Card>
  );
}
