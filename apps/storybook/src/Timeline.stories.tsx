import { expect, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DethinkProvider,
  Timeline,
  TimelineFeed,
  type TimelineItemData,
} from "@dethink/components";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const meta = {
  title: "Components/Timeline",
  component: Timeline,
  args: {
    items: [],
    mode: "events",
    orientation: "vertical",
    layout: "rail",
    scale: "auto",
    order: "asc",
    interactive: true,
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["events", "progress", "story"] },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    layout: {
      control: "inline-radio",
      options: ["rail", "alternating", "stacked", "story"],
    },
    scale: { control: "inline-radio", options: ["auto", "time", "sequence"] },
    order: { control: "inline-radio", options: ["asc", "desc"] },
  },
} satisfies Meta<typeof Timeline>;

export default meta;

type Story = StoryObj<typeof meta>;

const eventItems: TimelineItemData[] = [
  {
    id: "research",
    title: "Research complete",
    description:
      "Competitive review, user needs, and core interaction model approved.",
    datetime: "2026-01-12T09:00:00Z",
    dateLabel: "Jan 12, 2026",
    status: "complete",
  },
  {
    id: "prototype",
    title: "Prototype review",
    description:
      "Interactive DOM viewport validated with product and accessibility notes.",
    datetime: "2026-02-03T14:30:00Z",
    dateLabel: "Feb 3, 2026",
    status: "complete",
  },
  {
    id: "beta",
    title: "Private beta",
    description:
      "Selected teams start using event and progress timelines in dashboards.",
    datetime: "2026-03-18T10:00:00Z",
    dateLabel: "Mar 18, 2026",
    status: "current",
  },
  {
    id: "launch",
    title: "General availability",
    description:
      "Registry item, package export, docs, tests, and release notes are ready.",
    datetime: "2026-05-05T10:00:00Z",
    dateLabel: "May 5, 2026",
    status: "upcoming",
  },
];

const imageItems: TimelineItemData[] = [
  {
    id: "brief",
    title: "Launch brief",
    description:
      "Strategy, risks, and stakeholder responsibilities are captured.",
    datetime: "2026-01-08T09:00:00Z",
    dateLabel: "Jan 8",
    status: "complete",
    image: {
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
      alt: "Team reviewing a project brief on a wall",
      width: 900,
      height: 600,
    },
  },
  {
    id: "build",
    title: "Build checkpoint",
    description:
      "Engineering validates package export, registry files, and Storybook states.",
    datetime: "2026-02-11T09:00:00Z",
    dateLabel: "Feb 11",
    status: "current",
    image: {
      src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
      alt: "Laptop showing dashboard work",
      width: 900,
      height: 600,
    },
  },
  {
    id: "qa",
    title: "Quality review",
    description:
      "Accessibility, visual, and interaction checks run before release.",
    datetime: "2026-03-10T09:00:00Z",
    dateLabel: "Mar 10",
    status: "warning",
    image: {
      src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
      alt: "Dashboard review notes on a desk",
      width: 900,
      height: 600,
    },
  },
];

const progressItems: TimelineItemData[] = [
  {
    id: "queued",
    title: "Queued",
    description:
      "The request is captured and waiting for the next build window.",
    status: "complete",
  },
  {
    id: "building",
    title: "Building",
    description: "The implementation is active and package checks are running.",
    status: "current",
  },
  {
    id: "review",
    title: "Review",
    description: "Design, accessibility, and registry review are pending.",
    status: "upcoming",
  },
  {
    id: "blocked",
    title: "Blocked example",
    description:
      "Disabled milestones remain visible but are skipped by selection.",
    status: "error",
    disabled: true,
  },
];

const storyItems: TimelineItemData[] = [
  {
    id: "transformer",
    title: "Attention changes the map",
    description:
      "The Transformer made attention the core primitive, giving language models a cleaner way to learn context at scale.",
    datetime: "2017-01-01T00:00:00Z",
    dateLabel: "2017",
    status: "complete",
    marker: <span className="font-mono text-[10px] font-bold">T</span>,
  },
  {
    id: "scale",
    title: "Scale becomes the story",
    description:
      "Large pretrained models showed that more data, compute, and parameters could unlock useful few-shot behavior.",
    datetime: "2020-01-01T00:00:00Z",
    dateLabel: "2020",
    status: "complete",
    marker: <span className="font-mono text-[10px] font-bold">S</span>,
  },
  {
    id: "chat",
    title: "Chat becomes the interface",
    description:
      "Conversational assistants made LLMs feel less like research demos and more like everyday software.",
    datetime: "2022-01-01T00:00:00Z",
    dateLabel: "2022",
    status: "complete",
    marker: <span className="font-mono text-[10px] font-bold">C</span>,
  },
  {
    id: "agents",
    title: "Models become teammates",
    description:
      "LLMs now read, write, see, call tools, and coordinate multi-step work across product workflows.",
    datetime: "2026-01-01T00:00:00Z",
    dateLabel: "2026",
    status: "current",
    marker: <span className="font-mono text-[10px] font-bold">A</span>,
  },
];

type DeploymentPayload = {
  service: string;
  owner: string;
  environment: "staging" | "production";
  version: string;
  checks: Array<{ label: string; value: string }>;
};

type PlanetPayload = {
  planet: string;
  sector: string;
  mission: string;
  distance: string;
  velocity: string;
  signal: string;
  orbitalAngle: string;
  orbitDuration: string;
  core: string;
  rim: string;
  shadow: string;
  glow: string;
  telemetry: Array<{ label: string; value: string }>;
};

type PlanetStyle = CSSProperties & {
  "--planet-core": string;
  "--planet-rim": string;
  "--planet-shadow": string;
  "--planet-glow": string;
  "--orbit-duration": string;
};

const deploymentItems: TimelineItemData<DeploymentPayload>[] = [
  {
    id: "api",
    datetime: "2026-04-04T10:00:00Z",
    dateLabel: "10:00",
    status: "complete",
    data: {
      service: "Billing API",
      owner: "Platform",
      environment: "staging",
      version: "v2.4.0-rc.1",
      checks: [
        { label: "Tests", value: "428 passed" },
        { label: "Risk", value: "Low" },
      ],
    },
  },
  {
    id: "worker",
    datetime: "2026-04-04T11:30:00Z",
    dateLabel: "11:30",
    status: "current",
    data: {
      service: "Invoice Worker",
      owner: "Revenue Ops",
      environment: "production",
      version: "v2.4.0",
      checks: [
        { label: "Queue", value: "Draining" },
        { label: "Risk", value: "Medium" },
      ],
    },
  },
  {
    id: "dashboard",
    datetime: "2026-04-04T13:00:00Z",
    dateLabel: "13:00",
    status: "upcoming",
    data: {
      service: "Admin Dashboard",
      owner: "Product",
      environment: "production",
      version: "v2.4.0",
      checks: [
        { label: "A11y", value: "Pending" },
        { label: "Risk", value: "Low" },
      ],
    },
  },
];

function getPlanetStyle(payload: PlanetPayload): PlanetStyle {
  return {
    "--planet-core": payload.core,
    "--planet-rim": payload.rim,
    "--planet-shadow": payload.shadow,
    "--planet-glow": payload.glow,
    "--orbit-duration": payload.orbitDuration,
  };
}

function PlanetMarker({
  core,
  rim,
  glow,
}: {
  core: string;
  rim: string;
  glow: string;
}) {
  return (
    <span
      aria-hidden="true"
      className="block size-4 rounded-full shadow-sm"
      style={{
        background: `radial-gradient(circle at 35% 25%, white 0 8%, ${core} 32%, ${rim} 76%, ${glow} 100%)`,
        boxShadow: `0 0 18px ${glow}`,
      }}
    />
  );
}

const planetItems: TimelineItemData<PlanetPayload>[] = [
  {
    id: "venus-window",
    datetime: "2026-07-02T08:00:00Z",
    dateLabel: "08:00 UTC",
    status: "complete",
    marker: (
      <PlanetMarker
        core="rgb(251 191 36)"
        rim="rgb(217 119 6)"
        glow="rgb(251 146 60 / 0.75)"
      />
    ),
    data: {
      planet: "Venus",
      sector: "Inner transfer",
      mission: "Atmospheric slingshot locked",
      distance: "0.72 AU",
      velocity: "35.0 km/s",
      signal: "98%",
      orbitalAngle: "47 deg",
      orbitDuration: "12s",
      core: "rgb(251 191 36)",
      rim: "rgb(217 119 6)",
      shadow: "rgb(120 53 15)",
      glow: "rgb(251 146 60 / 0.75)",
      telemetry: [
        { label: "Thermal", value: "High" },
        { label: "Window", value: "Open" },
        { label: "Drift", value: "0.03 deg" },
      ],
    },
  },
  {
    id: "earth-relay",
    datetime: "2026-07-04T12:30:00Z",
    dateLabel: "12:30 UTC",
    status: "current",
    marker: (
      <PlanetMarker
        core="rgb(34 197 94)"
        rim="rgb(59 130 246)"
        glow="rgb(45 212 191 / 0.75)"
      />
    ),
    data: {
      planet: "Earth",
      sector: "Command relay",
      mission: "Deep-space uplink synchronized",
      distance: "1.00 AU",
      velocity: "29.8 km/s",
      signal: "100%",
      orbitalAngle: "91 deg",
      orbitDuration: "10s",
      core: "rgb(34 197 94)",
      rim: "rgb(59 130 246)",
      shadow: "rgb(30 64 175)",
      glow: "rgb(45 212 191 / 0.75)",
      telemetry: [
        { label: "Array", value: "Goldstone" },
        { label: "Packets", value: "Clean" },
        { label: "Latency", value: "8 min" },
      ],
    },
  },
  {
    id: "mars-burn",
    datetime: "2026-07-08T18:15:00Z",
    dateLabel: "18:15 UTC",
    status: "warning",
    marker: (
      <PlanetMarker
        core="rgb(248 113 113)"
        rim="rgb(194 65 12)"
        glow="rgb(244 63 94 / 0.7)"
      />
    ),
    data: {
      planet: "Mars",
      sector: "Insertion burn",
      mission: "Periapsis trim awaiting confirmation",
      distance: "1.52 AU",
      velocity: "24.1 km/s",
      signal: "86%",
      orbitalAngle: "138 deg",
      orbitDuration: "14s",
      core: "rgb(248 113 113)",
      rim: "rgb(194 65 12)",
      shadow: "rgb(127 29 29)",
      glow: "rgb(244 63 94 / 0.7)",
      telemetry: [
        { label: "Fuel", value: "42%" },
        { label: "Dust", value: "Rising" },
        { label: "Burn", value: "T-18h" },
      ],
    },
  },
  {
    id: "jupiter-assist",
    datetime: "2026-07-16T05:45:00Z",
    dateLabel: "05:45 UTC",
    status: "upcoming",
    marker: (
      <PlanetMarker
        core="rgb(216 180 254)"
        rim="rgb(125 92 255)"
        glow="rgb(168 85 247 / 0.65)"
      />
    ),
    data: {
      planet: "Jupiter",
      sector: "Outer assist",
      mission: "Gravity assist trajectory queued",
      distance: "5.20 AU",
      velocity: "13.1 km/s",
      signal: "73%",
      orbitalAngle: "214 deg",
      orbitDuration: "18s",
      core: "rgb(216 180 254)",
      rim: "rgb(125 92 255)",
      shadow: "rgb(76 29 149)",
      glow: "rgb(168 85 247 / 0.65)",
      telemetry: [
        { label: "Bands", value: "Mapped" },
        { label: "Radiation", value: "Guarded" },
        { label: "ETA", value: "9 days" },
      ],
    },
  },
];

const planetaryTimelineStyles = `
  .dt-planetary-field {
    position: relative;
    isolation: isolate;
    background:
      radial-gradient(circle at 12% 18%, rgb(45 212 191 / 0.22), transparent 28%),
      radial-gradient(circle at 82% 16%, rgb(168 85 247 / 0.22), transparent 26%),
      radial-gradient(circle at 52% 92%, rgb(251 146 60 / 0.16), transparent 30%),
      linear-gradient(135deg, rgb(3 7 18), rgb(15 23 42) 48%, rgb(2 6 23));
  }

  .dt-planetary-field::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    background-image:
      radial-gradient(circle, rgb(255 255 255 / 0.52) 0 1px, transparent 1.5px),
      radial-gradient(circle, rgb(125 211 252 / 0.34) 0 1px, transparent 1.5px);
    background-position: 0 0, 18px 22px;
    background-size: 42px 42px, 64px 64px;
    opacity: 0.55;
    animation: timeline-star-drift 24s linear infinite;
  }

  .dt-planet-card {
    position: relative;
    isolation: isolate;
    min-height: 15rem;
    background:
      radial-gradient(circle at 18% 22%, var(--planet-glow), transparent 30%),
      radial-gradient(circle at 92% 88%, rgb(255 255 255 / 0.10), transparent 26%),
      linear-gradient(145deg, rgb(15 23 42 / 0.98), rgb(2 6 23 / 0.96));
  }

  .dt-planet-card::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      linear-gradient(115deg, transparent 0 44%, rgb(255 255 255 / 0.10) 45% 46%, transparent 48%),
      radial-gradient(circle at 74% 20%, rgb(255 255 255 / 0.18) 0 1px, transparent 1.5px);
    opacity: 0.75;
  }

  .dt-orbit {
    transform: rotate(0deg);
    animation: timeline-orbit-spin var(--orbit-duration) linear infinite;
  }

  .dt-planet {
    scale: 1;
    background:
      radial-gradient(circle at 32% 24%, rgb(255 255 255 / 0.95) 0 7%, var(--planet-core) 24%, var(--planet-rim) 68%, var(--planet-shadow) 100%);
    box-shadow:
      0 0 18px var(--planet-glow),
      inset -10px -12px 18px rgb(0 0 0 / 0.38),
      inset 8px 7px 12px rgb(255 255 255 / 0.25);
    transition: scale 180ms ease;
  }

  .dt-planet-card:hover .dt-planet {
    scale: 1.08;
  }

  .dt-signal {
    transform: scale(1);
    animation: timeline-signal-pulse 2.8s ease-in-out infinite;
  }

  @keyframes timeline-star-drift {
    to {
      background-position: 168px 84px, 210px 126px;
    }
  }

  @keyframes timeline-orbit-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes timeline-signal-pulse {
    0%, 100% {
      opacity: 0.45;
      transform: scale(0.88);
    }
    50% {
      opacity: 1;
      transform: scale(1.08);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dt-planetary-field::before,
    .dt-orbit,
    .dt-signal {
      animation: none;
    }
  }
`;

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="m3.5 8.5 3 3 6-7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export const Events: Story = {
  args: {
    items: eventItems,
    defaultSelectedId: "beta",
    viewport: { defaultZoom: 0.85 },
  },
  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Timeline {...args} />
    </DethinkProvider>
  ),
};

export const Progress: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Timeline
        mode="progress"
        scale="auto"
        layout="stacked"
        items={progressItems}
        defaultSelectedId="building"
      />
    </DethinkProvider>
  ),
};

export const StoryMode: Story = {
  args: {
    mode: "story",
    orientation: "vertical",
    scale: "sequence",
    layout: "alternating",
    interactive: false,
  },

  render: (args) => (
    <DethinkProvider theme="light" className="p-6">
      <Timeline {...args} items={storyItems} />
    </DethinkProvider>
  ),
};

export const ImageRich: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Timeline
        presentation="canvas"
        items={imageItems}
        layout="alternating"
        viewport={{ defaultZoom: 0.75, minZoom: 0.5, maxZoom: 2 }}
      />
    </DethinkProvider>
  ),
};

export const VerticalAlternating: Story = {
  args: {
    layout: "stacked",
  },

  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Timeline
        presentation="canvas"
        items={eventItems}
        orientation="vertical"
        layout="alternating"
        viewport={{ defaultZoom: 0.85 }}
      />
    </DethinkProvider>
  ),
};

export const CustomMarkerAndContent: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Timeline
        items={progressItems.map((item) => ({
          ...item,
          marker: item.status === "complete" ? <CheckIcon /> : item.marker,
        }))}
        mode="progress"
        renderItem={(item) => (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              {item.status}
            </p>
            <h3 className="text-foreground text-sm font-semibold">
              {item.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-6">
              {item.description}
            </p>
          </div>
        )}
      />
    </DethinkProvider>
  ),
};

export const CustomPayloadTemplate: Story = {
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Timeline<DeploymentPayload>
        aria-label="Deployment timeline"
        items={deploymentItems}
        defaultSelectedId="worker"
        viewport={{ defaultZoom: 0.9 }}
        renderItem={(item) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  {item.data?.environment}
                </p>
                <h3 className="text-foreground truncate text-sm font-semibold">
                  {item.data?.service}
                </h3>
              </div>
              <span className="border-timeline-border bg-muted text-muted-foreground shrink-0 rounded-sm border px-2 py-1 text-xs font-medium">
                {item.dateLabel}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Owner</p>
                <p className="text-foreground font-medium">
                  {item.data?.owner}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Version</p>
                <p className="text-foreground font-medium">
                  {item.data?.version}
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              {item.data?.checks.map((check) => (
                <div
                  key={check.label}
                  className="bg-muted flex items-center justify-between rounded-sm px-2 py-1 text-xs"
                >
                  <span className="text-muted-foreground">{check.label}</span>
                  <span className="text-foreground font-medium">
                    {check.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      />
    </DethinkProvider>
  ),
};

export const PlanetaryPositions: Story = {
  render: () => (
    <DethinkProvider theme="dark" className="p-6">
      <style>{planetaryTimelineStyles}</style>
      <div className="dt-planetary-field overflow-hidden rounded-md p-5 shadow-2xl">
        <Timeline<PlanetPayload>
          presentation="canvas"
          aria-label="Planetary position timeline"
          items={planetItems}
          layout="alternating"
          scale="sequence"
          defaultSelectedId="earth-relay"
          viewport={{
            defaultZoom: 0.56,
            minZoom: 0.45,
            maxZoom: 1.8,
            chrome: "none",
            controlsVisibility: "hover",
          }}
          className="[&_[data-slot=timeline-card]]:border-white/15 [&_[data-slot=timeline-card]]:shadow-2xl [&_[data-slot=timeline-marker]]:border-white/30 [&_[data-slot=timeline-rail]]:bg-cyan-200/40"
          renderItem={(item) => {
            const payload = item.data;

            if (!payload) {
              return null;
            }

            return (
              <div
                className="dt-planet-card -m-4 overflow-hidden rounded-md p-4 text-white"
                style={getPlanetStyle(payload)}
              >
                <div className="relative flex items-start gap-3">
                  <div
                    aria-hidden="true"
                    className="dt-orbit relative size-20 shrink-0 rounded-full border border-white/15"
                  >
                    <span className="absolute inset-2 rounded-full border border-dashed border-white/15" />
                    <span className="dt-signal absolute top-1/2 -right-1 size-2 -translate-y-1/2 rounded-full bg-white" />
                    <span className="dt-planet absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                    <span className="absolute top-1/2 left-1/2 h-px w-16 -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] rounded-full bg-white/25" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-cyan-100/75 uppercase">
                          {payload.sector}
                        </p>
                        <h3 className="truncate text-base font-semibold text-white">
                          {payload.planet}
                        </h3>
                      </div>
                      <span className="shrink-0 rounded-sm border border-white/15 bg-white/10 px-2 py-1 text-xs font-medium text-cyan-50">
                        {item.dateLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                      {payload.mission}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {payload.telemetry.map((entry) => (
                    <div
                      key={entry.label}
                      className="rounded-sm border border-white/10 bg-white/10 px-2 py-2"
                    >
                      <p className="text-[0.68rem] font-medium text-cyan-100/70 uppercase">
                        {entry.label}
                      </p>
                      <p className="mt-1 truncate text-xs font-semibold text-white">
                        {entry.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-xs">
                  <div>
                    <p className="text-cyan-100/65">Distance</p>
                    <p className="font-semibold text-white">
                      {payload.distance}
                    </p>
                  </div>
                  <div>
                    <p className="text-cyan-100/65">Velocity</p>
                    <p className="font-semibold text-white">
                      {payload.velocity}
                    </p>
                  </div>
                  <div>
                    <p className="text-cyan-100/65">Signal</p>
                    <p className="font-semibold text-white">{payload.signal}</p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-cyan-100/70">
                  Orbital angle {payload.orbitalAngle}
                </p>
              </div>
            );
          }}
        />
      </div>
    </DethinkProvider>
  ),
};

export const FlowPresentation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`presentation="flow"` renders event/progress timelines in normal document flow with a rail, markers, and the compact card styling instead of the pannable canvas. There is no drag, zoom, or viewport chrome, but keyboard prev/next/home/end navigation still works.',
      },
    },
  },
  render: () => (
    <div className="grid gap-8 lg:grid-cols-2">
      <DethinkProvider theme="light" className="p-6">
        <Timeline
          aria-label="Flow rail timeline"
          mode="events"
          presentation="flow"
          items={eventItems}
          defaultSelectedId="beta"
        />
      </DethinkProvider>
      <DethinkProvider theme="light" className="p-6">
        <Timeline
          aria-label="Flow alternating timeline"
          mode="events"
          presentation="flow"
          layout="alternating"
          items={eventItems}
        />
      </DethinkProvider>
    </div>
  ),
};

export const RevealStaggerOnMount: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`reveal="stagger"` fades and slides items in sequentially while the rail grows alongside. Animation is transform/opacity only and gated behind `motion-safe`; with `prefers-reduced-motion` every item is visible immediately and no motion runs. Reveal is a flow-presentation feature and is ignored for the canvas presentation.',
      },
    },
  },
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Timeline
        aria-label="Staggered reveal timeline"
        mode="events"
        presentation="flow"
        reveal="stagger"
        revealOptions={{ interval: 180, duration: 480 }}
        items={eventItems}
      />
    </DethinkProvider>
  ),
};

export const RevealAll: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`reveal="all"` animates every item in as a single group using one shared delay (`initialDelay`).',
      },
    },
  },
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <Timeline
        aria-label="Group reveal timeline"
        mode="events"
        presentation="flow"
        reveal="all"
        revealOptions={{ duration: 520, initialDelay: 80 }}
        items={eventItems}
      />
    </DethinkProvider>
  ),
};

export const RevealInView: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With `revealOptions.trigger="in-view"` a single IntersectionObserver reveals items as they scroll into view. Scroll the panel to reveal later milestones; once revealed they stay revealed.',
      },
    },
  },
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <div className="border-timeline-border h-80 overflow-y-auto rounded-md border p-4">
        <p className="text-muted-foreground mb-6 text-sm">
          Scroll down to reveal milestones as they enter the viewport.
        </p>
        <Timeline
          aria-label="In-view reveal timeline"
          mode="events"
          presentation="flow"
          reveal="stagger"
          revealOptions={{ trigger: "in-view", interval: 120 }}
          items={[...eventItems, ...eventItems].map((item, index) => ({
            ...item,
            id: `${item.id}-${index}`,
          }))}
        />
      </div>
    </DethinkProvider>
  ),
};

function ControlledRevealDemo() {
  const [revealCount, setRevealCount] = useState(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="border-timeline-border bg-background hover:bg-muted rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm"
          onClick={() =>
            setRevealCount((count) => Math.min(count + 1, eventItems.length))
          }
        >
          Reveal next
        </button>
        <button
          type="button"
          className="border-timeline-border bg-background hover:bg-muted rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm"
          onClick={() => setRevealCount(0)}
        >
          Reset
        </button>
        <span className="text-muted-foreground text-sm">
          {revealCount} / {eventItems.length} revealed
        </span>
      </div>
      <Timeline
        aria-label="Controlled reveal timeline"
        mode="events"
        presentation="flow"
        reveal="stagger"
        revealOptions={{ trigger: "manual", duration: 420 }}
        revealCount={revealCount}
        items={eventItems}
      />
    </div>
  );
}

export const RevealControlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With `revealOptions.trigger="manual"` visibility is driven entirely by `revealCount`. Items with index < `revealCount` are revealed, and newly revealed items animate in.',
      },
    },
  },
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <ControlledRevealDemo />
    </DethinkProvider>
  ),
};

function StreamingRevealDemo() {
  const [count, setCount] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCount((current) => {
        if (current >= eventItems.length) {
          clearInterval(timerRef.current);
          return current;
        }
        return current + 1;
      });
    }, 1400);

    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <Timeline
      aria-label="Streaming reveal timeline"
      mode="events"
      presentation="flow"
      reveal="stagger"
      revealOptions={{ duration: 460 }}
      items={eventItems.slice(0, count)}
    />
  );
}

export const RevealStreamingAppend: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "When the `items` array grows, only the newly appended items animate in; already-revealed items are never re-animated. This demo appends a milestone every 1.4s.",
      },
    },
  },
  render: () => (
    <DethinkProvider theme="light" className="p-6">
      <StreamingRevealDemo />
    </DethinkProvider>
  ),
};

export const ThemeDensityAndRtl: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <DethinkProvider theme="dark" density="compact" className="p-6">
        <Timeline
          aria-label="Dark compact timeline"
          items={eventItems}
          viewport={{ defaultZoom: 0.85 }}
        />
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        density="comfortable"
        dir="rtl"
        className="p-6"
      >
        <Timeline
          aria-label="RTL comfortable timeline"
          items={eventItems}
          order="desc"
          viewport={{ defaultZoom: 0.85 }}
        />
      </DethinkProvider>
    </div>
  ),
};

export const GroupedDetails: Story = {
  render: () => (
    <DethinkProvider>
      <Timeline
        aria-label="Grouped activity"
        interactive={false}
        items={eventItems.map((item, index) => ({
          ...item,
          details: <p>Release notes for event {index + 1}.</p>,
        }))}
        getGroup={(item) => ({
          id: item.status === "complete" ? "done" : "next",
          label: item.status === "complete" ? "Completed" : "Next milestones",
        })}
      />
    </DethinkProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disclosure = canvas.getAllByRole("button", {
      name: /Show details/,
    })[0];
    await userEvent.click(disclosure);
    await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  },
};

export const Cards: Story = {
  args: { items: eventItems, variant: "cards", interactive: false },
};
export const Canvas: Story = {
  args: {
    items: eventItems,
    presentation: "canvas",
    orientation: "horizontal",
    viewport: { controlsVisibility: "always" },
  },
};
export const KeyboardFlow: Story = {
  args: { items: eventItems },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    buttons[0].focus();
    await userEvent.keyboard("{End}");
    await expect(buttons[buttons.length - 1]).toHaveFocus();
  },
};
function LiveFeedExample() {
  const [items, setItems] = useState(eventItems);
  return (
    <DethinkProvider>
      <button
        type="button"
        onClick={() =>
          setItems((current) => [
            ...current,
            {
              id: `new-${current.length}`,
              title: `New event ${current.length}`,
              status: "complete",
            },
          ])
        }
      >
        Add event
      </button>
      <TimelineFeed items={items} scale="sequence" interactive={false} />
    </DethinkProvider>
  );
}
export const LiveFeed: Story = { render: () => <LiveFeedExample /> };
