"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from "@dethink/components";

export function CardSignInForm() {
  return (
    <Card className="w-full max-w-sm" shadow="md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your work email to continue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="signin-email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="signin-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="signin-password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="signin-password"
            type="password"
            autoComplete="current-password"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Continue</Button>
      </CardFooter>
    </Card>
  );
}
