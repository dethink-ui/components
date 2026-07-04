"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from "@dethink/components";
import { Send, Settings2 } from "lucide-react";

const team = [
  { name: "Amara Osei", role: "Owner" },
  { name: "Jonas Weber", role: "Editor" },
];

export function LandingDemo() {
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState<string[]>([]);

  function invite(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    setInviting(true);
    setTimeout(() => {
      setInvited((current) => [...current, email]);
      setEmail("");
      setInviting(false);
    }, 900);
  }

  return (
    <Card className="w-full max-w-md" shadow="md">
      <CardHeader>
        <CardTitle>Invite your team</CardTitle>
        <CardDescription>
          A live composition of Card, Input, and Button.
        </CardDescription>
        <CardAction>
          <Button size="icon" variant="ghost" aria-label="Workspace settings">
            <Settings2 className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={invite} className="flex items-center gap-2">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teammate@company.com"
            aria-label="Teammate email"
            required
          />
          <Button type="submit" loading={inviting} leftIcon={<Send />}>
            Invite
          </Button>
        </form>
        <ul className="divide-y divide-border text-sm">
          {team.map((member) => (
            <li key={member.name} className="flex items-center justify-between py-2">
              <span className="font-medium">{member.name}</span>
              <span className="text-muted-foreground">{member.role}</span>
            </li>
          ))}
          {invited.map((address) => (
            <li key={address} className="flex items-center justify-between py-2">
              <span className="font-medium">{address}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Invited
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter justify="between">
        <p className="text-xs text-muted-foreground">2 seats remaining</p>
        <Button variant="soft" size="sm">
          Manage plan
        </Button>
      </CardFooter>
    </Card>
  );
}
