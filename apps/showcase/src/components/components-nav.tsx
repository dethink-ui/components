"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Badge as BadgeIcon,
  Box as BoxIcon,
  Calendar as CalendarIcon,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ChartGantt,
  ChevronsUpDown,
  CircleUserRound,
  CircleDot,
  Clock3,
  Columns3,
  Command,
  CreditCard,
  Dock,
  FormInput,
  GalleryHorizontalEnd,
  Grid3X3,
  Hash,
  Layers,
  Link2,
  ListCollapse,
  ListFilter,
  ListOrdered,
  MessageSquareWarning,
  Minus,
  MousePointerClick,
  Navigation,
  PanelLeft,
  PanelTop,
  PanelTopOpen,
  Rows3,
  Search,
  SquareCheck,
  SquareMousePointer,
  Sparkles,
  Table2,
  TableProperties,
  Tags,
  TextCursorInput,
  ToggleRight,
  Type,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { componentGroups } from "@/lib/components-meta";

const componentIcons: Record<string, LucideIcon> = {
  accordion: ListCollapse,
  "async-select": Search,
  avatar: CircleUserRound,
  "avatar-group": UsersRound,
  badge: BadgeIcon,
  box: BoxIcon,
  breadcrumb: Navigation,
  button: MousePointerClick,
  calendar: CalendarIcon,
  card: CreditCard,
  "card-scroller": GalleryHorizontalEnd,
  "card-stack": Layers,
  checkbox: SquareCheck,
  combobox: ChevronsUpDown,
  "command-palette": Command,
  container: PanelTop,
  "data-table": TableProperties,
  "date-picker": CalendarDays,
  "date-range-picker": CalendarRange,
  "date-time-picker": Clock3,
  dialog: PanelTopOpen,
  "dropdown-menu": ListFilter,
  "feedback-states": MessageSquareWarning,
  flex: Columns3,
  "form-field": FormInput,
  grid: Grid3X3,
  "hero-text-animation": Sparkles,
  "horizontal-accordion": ListCollapse,
  "icon-button": SquareMousePointer,
  input: TextCursorInput,
  link: Link2,
  "multi-select": SquareCheck,
  navigation: Navigation,
  "navigation-menu": Navigation,
  navdock: Dock,
  "number-input": Hash,
  pagination: ChevronsUpDown,
  popover: PanelTop,
  "radio-group": CircleDot,
  select: ListFilter,
  separator: Minus,
  sidebar: PanelLeft,
  "slot-planner": CalendarClock,
  stack: Rows3,
  steps: ListOrdered,
  switch: ToggleRight,
  table: Table2,
  "tag-input": Tags,
  textarea: TextCursorInput,
  chat: MessageSquareWarning,
  timeline: ChartGantt,
  tooltip: MessageSquareWarning,
  typography: Type,
};

export function ComponentsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Components" className="space-y-6">
      {componentGroups.map((group) => (
        <section key={group.id} aria-labelledby={`${group.id}-nav-heading`}>
          <p
            id={`${group.id}-nav-heading`}
            className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-[0.14em] uppercase"
          >
            {group.name}
          </p>
          <ul className="space-y-0.5">
            {group.components.map((component) => {
              const href = `/components/${component.slug}`;
              const active = pathname === href;
              const Icon = componentIcons[component.slug] ?? BoxIcon;

              return (
                <li key={component.slug}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`focus-visible:ring-ring focus-visible:ring-offset-background flex min-h-8 items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-3.5 shrink-0" />
                    <span className="min-w-0 truncate">{component.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
