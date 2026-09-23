"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  CreditCard,
  LifeBuoy,
  LogOut,
  Settings2,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
  DropdownMenuItemDescription,
  DropdownMenuLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@dethink/components";

const actions = [
  { label: "My profile", icon: UserRound },
  { label: "Preferences", icon: Settings2 },
  { label: "Notifications", icon: Bell },
  { label: "Billing", icon: CreditCard },
];

export function DropdownMenuAccount() {
  const [status, setStatus] = useState("");
  const choose = (label: string) =>
    setStatus(`${label} selected. This is a local demo.`);
  return (
    <div className="flex flex-col items-center gap-5">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Alex Morgan account"
          variant="outline"
          className="h-auto min-h-14 gap-3 rounded-full py-2 ps-2 pe-4 shadow-sm"
        >
          <span className="flex w-full items-center gap-3">
            {" "}
            <span
              aria-hidden="true"
              className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full text-sm font-semibold"
            >
              AM
            </span>
            <span className="text-start">
              <span className="block text-sm font-semibold">Alex Morgan</span>
              <span className="text-muted-foreground block text-xs font-normal">
                Personal account
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className="text-muted-foreground ms-3 size-4"
            />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          aria-label="Account"
          placement="bottom end"
          className="max-h-none w-72 rounded-xl p-1.5"
          menuClassName="max-h-[min(32rem,70dvh)]"
        >
          <DropdownMenuSection>
            <DropdownMenuLabel className="p-3 font-normal normal-case">
              <span className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full font-semibold"
                >
                  AM
                </span>
                <span className="min-w-0">
                  <span className="text-foreground block text-sm font-semibold">
                    Alex Morgan
                  </span>
                  <span className="block truncate text-xs">
                    alex@example.com
                  </span>
                </span>
                <span className="border-primary/20 bg-primary/10 text-primary ms-auto rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                  PRO
                </span>
              </span>
            </DropdownMenuLabel>
            {actions.map(({ label, icon: Icon }) => (
              <DropdownMenuItem
                key={label}
                textValue={label}
                onAction={() => choose(label)}
                className="rounded-lg px-3 py-2.5"
              >
                <DropdownMenuItemIcon>
                  <Icon aria-hidden="true" />
                </DropdownMenuItemIcon>
                <DropdownMenuItemLabel>{label}</DropdownMenuItemLabel>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSection>
          <DropdownMenuSeparator />
          <DropdownMenuSection aria-label="Plan">
            <DropdownMenuItem
              textValue="Explore team plan"
              onAction={() => choose("Team plan")}
              className="border-primary/15 bg-primary/5 m-1 rounded-lg border px-3 py-3"
            >
              <DropdownMenuItemIcon className="text-primary">
                <Sparkles aria-hidden="true" />
              </DropdownMenuItemIcon>
              <DropdownMenuItemLabel className="font-medium">
                Better together
              </DropdownMenuItemLabel>
              <ArrowUpRight
                aria-hidden="true"
                className="text-primary size-4"
              />
              <DropdownMenuItemDescription>
                Explore the Team plan
              </DropdownMenuItemDescription>
            </DropdownMenuItem>
          </DropdownMenuSection>
          <DropdownMenuSeparator />
          <DropdownMenuSection aria-label="Support and session">
            <DropdownMenuItem
              textValue="Help and support"
              onAction={() => choose("Help and support")}
              className="rounded-lg px-3 py-2.5"
            >
              <DropdownMenuItemIcon>
                <LifeBuoy aria-hidden="true" />
              </DropdownMenuItemIcon>
              <DropdownMenuItemLabel>Help & support</DropdownMenuItemLabel>
            </DropdownMenuItem>
            <DropdownMenuItem
              textValue="Sign out"
              destructive
              onAction={() => choose("Sign out")}
              className="rounded-lg px-3 py-2.5"
            >
              <DropdownMenuItemIcon>
                <LogOut aria-hidden="true" />
              </DropdownMenuItemIcon>
              <DropdownMenuItemLabel>Sign out</DropdownMenuItemLabel>
            </DropdownMenuItem>
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>
      <p
        role="status"
        className="text-muted-foreground min-h-5 text-center text-xs"
      >
        {status || "Your profile, preferences, and a little more."}
      </p>
    </div>
  );
}
