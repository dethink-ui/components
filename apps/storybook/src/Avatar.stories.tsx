import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactNode } from "react";
import { Bot, Building2, Sparkles, UserRound, Users } from "lucide-react";
import {
  Avatar,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DethinkProvider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type AvatarRing,
  type AvatarShape,
  type AvatarSize,
  type AvatarTone,
} from "@dethink/components";

function avatarImage(label: string, background: string, foreground: string) {
  const initials = label
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="${background}"/><circle cx="88" cy="38" r="18" fill="${foreground}" opacity=".18"/><circle cx="42" cy="86" r="24" fill="${foreground}" opacity=".16"/><text x="64" y="75" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="38" font-weight="700" fill="${foreground}">${initials}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const images = {
  ada: avatarImage(
    "Ada Lovelace",
    "oklch(0.92 0.05 250)",
    "oklch(0.24 0.15 260)",
  ),
  grace: avatarImage(
    "Grace Hopper",
    "oklch(0.9 0.06 150)",
    "oklch(0.28 0.11 155)",
  ),
  maya: avatarImage("Maya Lin", "oklch(0.9 0.07 70)", "oklch(0.32 0.12 70)"),
};

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  args: {
    name: "Ada Lovelace",
    size: "md",
    shape: "circle",
    tone: "neutral",
    ring: "none",
    motion: "standard",
    src: images.ada,
  },
  argTypes: {
    motion: {
      control: "inline-radio",
      options: ["none", "subtle", "standard"],
    },
    ring: {
      control: "inline-radio",
      options: ["none", "border", "ring"],
    },
    shape: {
      control: "inline-radio",
      options: ["circle", "rounded", "square"],
    },
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg", "xl", "2xl"],
    },
    tone: {
      control: "inline-radio",
      options: [
        "neutral",
        "primary",
        "success",
        "warning",
        "destructive",
        "info",
      ],
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

const sizes: AvatarSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
const shapes: AvatarShape[] = ["circle", "rounded", "square"];
const rings: AvatarRing[] = ["none", "border", "ring"];
const tones: AvatarTone[] = [
  "neutral",
  "primary",
  "success",
  "warning",
  "destructive",
  "info",
];

const highContrastStyle = {
  "--dt-color-background-light": "oklch(1 0 0)",
  "--dt-color-foreground-light": "oklch(0 0 0)",
  "--dt-color-muted-light": "oklch(0.95 0 0)",
  "--dt-color-muted-foreground-light": "oklch(0.2 0 0)",
  "--dt-color-border-light": "oklch(0 0 0)",
  "--dt-color-ring-light": "oklch(0 0 0)",
  "--dt-color-primary-light": "oklch(0.22 0.17 260)",
  "--dt-color-success-light": "oklch(0.34 0.14 145)",
  "--dt-color-warning-light": "oklch(0.63 0.17 75)",
  "--dt-color-destructive-light": "oklch(0.45 0.22 28)",
  "--dt-color-info-light": "oklch(0.32 0.16 245)",
} as CSSProperties;

function IdentityRow({
  avatar,
  badge,
  meta,
  name,
}: {
  avatar: ReactNode;
  badge?: ReactNode;
  meta: string;
  name: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-[var(--dt-space-3)]">
      {avatar}
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-[var(--dt-space-2)]">
          <p className="text-foreground truncate text-sm font-medium">{name}</p>
          {badge}
        </div>
        <p className="text-muted-foreground truncate text-xs">{meta}</p>
      </div>
    </div>
  );
}

export const Base: Story = {};

export const FallbackStates: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border grid max-w-md gap-4 rounded-lg border p-6"
    >
      <IdentityRow
        avatar={
          <Avatar alt="Ada Lovelace" name="Ada Lovelace" src={images.ada} />
        }
        badge={<Badge size="xs">User</Badge>}
        meta="Profile image"
        name="Ada Lovelace"
      />
      <IdentityRow
        avatar={<Avatar name="Grace Hopper" tone="success" />}
        badge={
          <Badge size="xs" tone="success">
            Active
          </Badge>
        }
        meta="Generated initials"
        name="Grace Hopper"
      />
      <IdentityRow
        avatar={<Avatar initials="AI" name="AI reviewer" tone="info" />}
        badge={
          <Badge size="xs" tone="info">
            AI
          </Badge>
        }
        meta="Explicit initials"
        name="AI reviewer"
      />
      <IdentityRow
        avatar={
          <Avatar
            fallbackIcon={<Users />}
            name="Platform team"
            shape="rounded"
            tone="primary"
          />
        }
        badge={
          <Badge size="xs" tone="primary">
            Team
          </Badge>
        }
        meta="Icon fallback"
        name="Platform team"
      />
      <IdentityRow
        avatar={
          <Avatar
            initials="ML"
            name="Model Lab"
            shape="square"
            src="/missing-avatar-image.png"
            tone="warning"
          />
        }
        badge={
          <Badge size="xs" tone="warning">
            Missing image
          </Badge>
        }
        meta="Failed image fallback"
        name="Model Lab"
      />
    </DethinkProvider>
  ),
};

export const SizesShapesAndRings: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border grid gap-6 rounded-lg border p-6"
    >
      <div className="flex flex-wrap items-center gap-[var(--dt-space-3)]">
        {sizes.map((size) => (
          <div key={size} className="grid justify-items-center gap-2">
            <Avatar name={`Size ${size}`} size={size} src={images.grace} />
            <span className="text-muted-foreground text-xs">{size}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {shapes.map((shape) => (
          <div
            key={shape}
            className="flex items-center gap-[var(--dt-space-3)]"
          >
            <Avatar
              name={`${shape} organization`}
              shape={shape}
              size="lg"
              tone="primary"
            />
            <span className="text-foreground text-sm font-medium capitalize">
              {shape}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-[var(--dt-space-4)]">
        {rings.map((ring) => (
          <div
            key={ring}
            className="bg-muted flex items-center gap-[var(--dt-space-3)] rounded-md p-3"
          >
            <Avatar name={`${ring} ring`} ring={ring} src={images.maya} />
            <span className="text-foreground text-sm font-medium">{ring}</span>
          </div>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const ToneMatrix: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border grid gap-3 rounded-lg border p-6"
    >
      <div className="flex flex-wrap items-center gap-[var(--dt-space-3)]">
        {tones.map((tone) => (
          <div key={tone} className="grid justify-items-center gap-2">
            <Avatar name={`${tone} fallback`} tone={tone} />
            <span className="text-muted-foreground text-xs capitalize">
              {tone}
            </span>
          </div>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const EntityExamples: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="grid max-w-4xl gap-4 md:grid-cols-2"
    >
      <Card>
        <CardHeader>
          <CardTitle as="h2">Review queue</CardTitle>
          <CardDescription>
            Authors and reviewers for generated summaries.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <IdentityRow
            avatar={<Avatar decorative name="Maya Lin" src={images.maya} />}
            badge={<Badge size="xs">Owner</Badge>}
            meta="Human reviewer"
            name="Maya Lin"
          />
          <IdentityRow
            avatar={
              <Avatar
                decorative
                fallbackIcon={<Bot />}
                name="AI reviewer"
                tone="info"
              />
            }
            badge={
              <Badge size="xs" tone="info">
                AI
              </Badge>
            }
            meta="Model-generated draft"
            name="AI reviewer"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle as="h2">Workspace identities</CardTitle>
          <CardDescription>
            People, teams, organizations, and anonymous traffic.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <IdentityRow
            avatar={
              <Avatar
                decorative
                fallbackIcon={<Users />}
                name="Platform team"
                shape="rounded"
                tone="primary"
              />
            }
            badge={
              <Badge size="xs" tone="primary">
                Team
              </Badge>
            }
            meta="6 active members"
            name="Platform team"
          />
          <IdentityRow
            avatar={
              <Avatar
                decorative
                fallbackIcon={<Building2 />}
                name="Acme Operations"
                shape="square"
                tone="success"
              />
            }
            badge={
              <Badge size="xs" tone="success">
                Org
              </Badge>
            }
            meta="Enterprise account"
            name="Acme Operations"
          />
          <IdentityRow
            avatar={
              <Avatar
                decorative
                fallbackIcon={<UserRound />}
                name="Anonymous visitor"
                tone="neutral"
              />
            }
            badge={<Badge size="xs">Guest</Badge>}
            meta="Unauthenticated session"
            name="Anonymous visitor"
          />
        </CardContent>
      </Card>
    </DethinkProvider>
  ),
};

export const AdjacentVisibleNames: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border max-w-3xl rounded-lg border p-4"
    >
      <Table density="compact">
        <TableHeader>
          <TableRow>
            <TableHead>Assignee</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            {
              avatar: <Avatar alt="" name="Ada Lovelace" src={images.ada} />,
              name: "Ada Lovelace",
              status: "Ready",
              team: "Analytics",
              tone: "success" as const,
            },
            {
              avatar: <Avatar decorative name="Grace Hopper" tone="primary" />,
              name: "Grace Hopper",
              status: "Reviewing",
              team: "Runtime",
              tone: "info" as const,
            },
            {
              avatar: (
                <Avatar
                  decorative
                  fallbackIcon={<Sparkles />}
                  name="AI reviewer"
                  tone="info"
                />
              ),
              name: "AI reviewer",
              status: "Drafting",
              team: "Model ops",
              tone: "warning" as const,
            },
          ].map((row) => (
            <TableRow key={row.name}>
              <TableCell>
                <div className="flex items-center gap-[var(--dt-space-2)]">
                  {row.avatar}
                  <span className="font-medium">{row.name}</span>
                </div>
              </TableCell>
              <TableCell>{row.team}</TableCell>
              <TableCell>
                <Badge size="xs" tone={row.tone}>
                  {row.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndContrast: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      <DethinkProvider
        theme="dark"
        className="border-border bg-background grid gap-4 rounded-lg border p-6"
      >
        <IdentityRow
          avatar={
            <Avatar
              decorative
              name="Ada Lovelace"
              ring="ring"
              src={images.ada}
            />
          }
          badge={
            <Badge size="xs" tone="success">
              Dark
            </Badge>
          }
          meta="Layered surface"
          name="Ada Lovelace"
        />
        <IdentityRow
          avatar={
            <Avatar
              decorative
              fallbackIcon={<Bot />}
              name="AI reviewer"
              tone="info"
            />
          }
          badge={
            <Badge size="xs" tone="info">
              AI
            </Badge>
          }
          meta="Fallback icon"
          name="AI reviewer"
        />
      </DethinkProvider>
      <DethinkProvider
        density="compact"
        theme="light"
        className="border-border grid gap-4 rounded-lg border p-6"
      >
        <IdentityRow
          avatar={
            <Avatar decorative name="Compact owner" size="sm" tone="primary" />
          }
          badge={
            <Badge size="xs" tone="primary">
              Compact
            </Badge>
          }
          meta="Dense table scale"
          name="Compact owner"
        />
        <IdentityRow
          avatar={
            <Avatar
              decorative
              name="Compact bot"
              size="sm"
              fallbackIcon={<Bot />}
              tone="info"
            />
          }
          badge={
            <Badge size="xs" tone="info">
              Bot
            </Badge>
          }
          meta="Dense metadata row"
          name="Compact bot"
        />
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        style={highContrastStyle}
        className="border-border grid gap-4 rounded-lg border p-6 md:col-span-2"
      >
        <div className="flex flex-wrap items-center gap-[var(--dt-space-4)]">
          {tones.map((tone) => (
            <Avatar
              key={tone}
              name={`${tone} contrast`}
              ring="border"
              tone={tone}
            />
          ))}
        </div>
      </DethinkProvider>
    </div>
  ),
};

export const RightToLeft: Story = {
  render: () => (
    <DethinkProvider
      dir="rtl"
      theme="light"
      className="border-border grid max-w-xl gap-4 rounded-lg border p-6"
    >
      <IdentityRow
        avatar={
          <Avatar
            decorative
            name="فريق العمليات"
            shape="rounded"
            tone="primary"
          />
        }
        badge={
          <Badge size="xs" tone="primary">
            فريق
          </Badge>
        }
        meta="ستة أعضاء"
        name="فريق العمليات"
      />
      <IdentityRow
        avatar={<Avatar alt="" name="ليلى حسن" src={images.grace} />}
        badge={
          <Badge size="xs" tone="success">
            نشط
          </Badge>
        }
        meta="مراجعة الحسابات"
        name="ليلى حسن"
      />
    </DethinkProvider>
  ),
};

export const MotionPresets: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border flex flex-wrap items-center gap-[var(--dt-space-5)] rounded-lg border p-6"
    >
      {(["none", "subtle", "standard"] as const).map((motion) => (
        <div key={motion} className="grid justify-items-center gap-2">
          <Avatar
            motion={motion}
            name={`${motion} motion`}
            ring="border"
            src={motion === "none" ? images.ada : undefined}
            tone={motion === "standard" ? "primary" : "neutral"}
          />
          <span className="text-muted-foreground text-xs">{motion}</span>
        </div>
      ))}
    </DethinkProvider>
  ),
};
