"use client";

import { useState } from "react";
import {
  NavDock,
  RadioGroup,
  RadioGroupItem,
  type NavDockItemData,
  type NavDockMotion,
  type NavDockPlacement,
  type NavDockShowTitle,
  type NavDockSize,
  type NavDockVariant,
} from "@dethink/components";
import {
  CalendarDays,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Users,
} from "lucide-react";

const iconProps = {
  "aria-hidden": true,
  absoluteStrokeWidth: true,
  strokeWidth: 2.1,
};

function ControlGroup<T extends string>({
  label,
  name,
  onChange,
  options,
  value,
}: {
  label: string;
  name: string;
  onChange: (value: T) => void;
  options: readonly T[];
  value: T;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </legend>
      <RadioGroup
        aria-label={label}
        controlSize="sm"
        name={name}
        orientation="horizontal"
        value={value}
        onValueChange={(nextValue) => onChange(nextValue as T)}
      >
        {options.map((option) => (
          <label
            key={option}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium capitalize text-muted-foreground has-checked:text-foreground"
          >
            <RadioGroupItem value={option} />
            {option}
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}

export function NavDockPlayground() {
  const [placement, setPlacement] = useState<NavDockPlacement>("bottom");
  const [size, setSize] = useState<NavDockSize>("md");
  const [variant, setVariant] = useState<NavDockVariant>("glass");
  const [motion, setMotion] = useState<NavDockMotion>("standard");
  const [showTitle, setShowTitle] = useState<NavDockShowTitle>("hover");
  const [currentPanel, setCurrentPanel] = useState("dashboard");

  const items: NavDockItemData[] = [
    {
      icon: <LayoutDashboard {...iconProps} />,
      onAction: () => setCurrentPanel("dashboard"),
      title: "Dashboard",
      value: "dashboard",
    },
    {
      badge: 4,
      icon: <Inbox {...iconProps} />,
      onAction: () => setCurrentPanel("inbox"),
      title: "Inbox",
      value: "inbox",
    },
    {
      icon: <FolderKanban {...iconProps} />,
      onAction: () => setCurrentPanel("projects"),
      title: "Projects",
      value: "projects",
    },
    {
      icon: <CalendarDays {...iconProps} />,
      onAction: () => setCurrentPanel("calendar"),
      title: "Calendar",
      value: "calendar",
    },
    {
      icon: <Users {...iconProps} />,
      submenu: [
        { kind: "label", title: "Team", value: "team-label" },
        {
          description: "Invite and manage members.",
          href: "#members",
          title: "Members",
          value: "members",
        },
        {
          badge: 2,
          description: "Pending role requests.",
          href: "#requests",
          title: "Requests",
          value: "requests",
        },
        { kind: "separator", value: "team-separator" },
        {
          external: true,
          href: "https://example.com/directory",
          title: "Company directory",
          value: "directory",
        },
      ],
      title: "Team",
      value: "team",
    },
    {
      disabled: true,
      disabledReason: "Support is offline right now.",
      icon: <LifeBuoy {...iconProps} />,
      onAction: () => setCurrentPanel("support"),
      title: "Support",
      value: "support",
    },
  ];

  const vertical = placement === "left" || placement === "right";

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-x-6 gap-y-4">
        <ControlGroup
          label="Placement"
          name="navdock-playground-placement"
          options={["bottom", "top", "left", "right"] as const}
          value={placement}
          onChange={setPlacement}
        />
        <ControlGroup
          label="Size"
          name="navdock-playground-size"
          options={["sm", "md", "lg"] as const}
          value={size}
          onChange={setSize}
        />
        <ControlGroup
          label="Variant"
          name="navdock-playground-variant"
          options={["default", "glass", "solid"] as const}
          value={variant}
          onChange={setVariant}
        />
        <ControlGroup
          label="Motion"
          name="navdock-playground-motion"
          options={["none", "subtle", "standard", "expressive"] as const}
          value={motion}
          onChange={setMotion}
        />
        <ControlGroup
          label="Titles"
          name="navdock-playground-titles"
          options={["never", "hover", "always"] as const}
          value={showTitle}
          onChange={setShowTitle}
        />
      </div>

      <div
        className={`flex min-h-[22rem] items-center rounded-lg border border-border bg-muted/25 p-8 ${
          vertical
            ? placement === "left"
              ? "justify-start"
              : "justify-end"
            : "justify-center"
        } ${placement === "top" ? "items-start" : ""} ${
          placement === "bottom" ? "items-end" : ""
        }`}
      >
        <NavDock
          aria-label="Playground navigation dock"
          collapseMode="none"
          currentValue={currentPanel}
          items={items}
          motion={motion}
          placement={placement}
          showTitle={showTitle}
          size={size}
          variant={variant}
        />
      </div>

      <p className="text-sm leading-6 text-muted-foreground">
        Sweep the pointer along the dock to feel the continuous magnification,
        open the Team submenu, and switch motion presets to compare spring
        characters. The Support item shows the disabled state.
      </p>
    </div>
  );
}
