"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardStack,
  CardTitle,
} from "@dethink/components";

const plans = [
  { name: "Starter", price: "$0", blurb: "Two projects, community support." },
  { name: "Team", price: "$29", blurb: "Unlimited projects, shared themes." },
  { name: "Scale", price: "$99", blurb: "SSO, audit log, priority support." },
];

export function CardStackOpen() {
  return (
    <CardStack
      aria-label="Pricing plans"
      mode="open"
      angle={10}
      defaultActiveIndex={1}
    >
      {plans.map((plan) => (
        <Card key={plan.name}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.price} per month</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {plan.blurb}
          </CardContent>
        </Card>
      ))}
    </CardStack>
  );
}
