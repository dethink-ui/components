"use client";

import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@dethink/components";
import { Settings2 } from "lucide-react";

const members = [
  { name: "Amara Osei", role: "Owner" },
  { name: "Jonas Weber", role: "Editor" },
  { name: "Priya Nair", role: "Viewer" },
];

export function CardWithAction() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Team members</CardTitle>
        <CardDescription>People with access to this project.</CardDescription>
        <CardAction>
          <Button size="icon" variant="ghost" aria-label="Manage team settings">
            <Settings2 className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {members.map((member) => (
            <li
              key={member.name}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <span className="font-medium">{member.name}</span>
              <span className="text-muted-foreground">{member.role}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
