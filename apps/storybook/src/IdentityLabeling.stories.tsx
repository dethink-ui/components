import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties, ReactNode } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Cpu,
  Database,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DethinkProvider,
  Label,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type AvatarGroupMember,
  type BadgeTone,
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
  katherine: avatarImage(
    "Katherine Johnson",
    "oklch(0.92 0.06 75)",
    "oklch(0.3 0.12 70)",
  ),
  maya: avatarImage("Maya Lin", "oklch(0.9 0.07 20)", "oklch(0.32 0.13 25)"),
};

const highContrastStyle = {
  "--dt-color-background-light": "oklch(1 0 0)",
  "--dt-color-foreground-light": "oklch(0 0 0)",
  "--dt-color-muted-light": "oklch(0.95 0 0)",
  "--dt-color-muted-foreground-light": "oklch(0.18 0 0)",
  "--dt-color-border-light": "oklch(0 0 0)",
  "--dt-color-input-light": "oklch(0 0 0)",
  "--dt-color-ring-light": "oklch(0 0 0)",
  "--dt-color-primary-light": "oklch(0.2 0.16 260)",
  "--dt-color-primary-foreground-light": "oklch(1 0 0)",
  "--dt-color-success-light": "oklch(0.3 0.13 145)",
  "--dt-color-success-foreground-light": "oklch(1 0 0)",
  "--dt-color-warning-light": "oklch(0.62 0.17 75)",
  "--dt-color-warning-foreground-light": "oklch(0 0 0)",
  "--dt-color-destructive-light": "oklch(0.42 0.22 28)",
  "--dt-color-destructive-foreground-light": "oklch(1 0 0)",
  "--dt-color-info-light": "oklch(0.28 0.16 245)",
  "--dt-color-info-foreground-light": "oklch(1 0 0)",
} as CSSProperties;

const nativeInputClasses =
  "min-h-density-control w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm outline-none motion-safe:transition-[border-color,box-shadow] motion-safe:duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/15 sm:text-sm";

const reviewers: AvatarGroupMember[] = [
  {
    metadata: "Design systems",
    name: "Ada Lovelace",
    src: images.ada,
    tone: "primary",
  },
  {
    metadata: "Runtime",
    name: "Grace Hopper",
    src: images.grace,
    tone: "success",
  },
  {
    metadata: "Security",
    name: "Maya Lin",
    src: images.maya,
    tone: "warning",
  },
  {
    metadata: "Analytics",
    name: "Katherine Johnson",
    src: images.katherine,
    tone: "info",
  },
];

const operators: AvatarGroupMember[] = [
  { metadata: "Incident lead", name: "Priya Shah", tone: "primary" },
  { metadata: "Database", name: "Mateo Garcia", tone: "success" },
  { metadata: "QA", name: "Sam Rivera", tone: "info" },
  { metadata: "Support", name: "Nora Chen", tone: "warning" },
];

const aiReviewers: AvatarGroupMember[] = [
  {
    fallbackIcon: <Bot />,
    metadata: "Assistant",
    name: "Dethink Copilot",
    tone: "info",
  },
  {
    fallbackIcon: <Cpu />,
    metadata: "Model router",
    name: "Policy model",
    shape: "rounded",
    tone: "primary",
  },
  {
    fallbackIcon: <ShieldCheck />,
    metadata: "Human review",
    name: "Trust desk",
    shape: "rounded",
    tone: "success",
  },
];

const operationsRows: Array<{
  detail: string;
  members: AvatarGroupMember[];
  owner: string;
  ownerAvatar: ReactNode;
  status: string;
  statusIcon: ReactNode;
  tone: BadgeTone;
  workflow: string;
}> = [
  {
    detail: "Production billing export",
    members: reviewers,
    owner: "Ada Lovelace",
    ownerAvatar: (
      <Avatar decorative alt="" name="Ada Lovelace" src={images.ada} />
    ),
    status: "Ready",
    statusIcon: <CheckCircle2 />,
    tone: "success",
    workflow: "Billing export",
  },
  {
    detail: "Requires database owner confirmation",
    members: operators,
    owner: "Grace Hopper",
    ownerAvatar: (
      <Avatar
        decorative
        alt=""
        name="Grace Hopper"
        src={images.grace}
        tone="success"
      />
    ),
    status: "Needs review",
    statusIcon: <AlertTriangle />,
    tone: "warning",
    workflow: "Retention policy",
  },
  {
    detail: "AI draft awaiting trust desk review",
    members: aiReviewers,
    owner: "Dethink Copilot",
    ownerAvatar: (
      <Avatar
        decorative
        fallbackIcon={<Bot />}
        name="Dethink Copilot"
        tone="info"
      />
    ),
    status: "AI assisted",
    statusIcon: <Sparkles />,
    tone: "info",
    workflow: "Contract summary",
  },
];

const meta = {
  title: "Components/Identity Labeling",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Composition recipes for Badge, Avatar, AvatarGroup, and Label across dense SaaS, internal-tool, and AI metadata surfaces.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function PersonSummary({
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

function StatusBadge({
  children,
  icon,
  tone,
}: {
  children: ReactNode;
  icon: ReactNode;
  tone: BadgeTone;
}) {
  return (
    <Badge icon={icon} size="xs" tone={tone} variant="soft">
      {children}
    </Badge>
  );
}

function ReviewCard({
  densityLabel,
  members,
  title,
}: {
  densityLabel: string;
  members: AvatarGroupMember[];
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle as="h2">{title}</CardTitle>
          <CardDescription>
            Identity metadata stays readable in card headers and compact action
            areas.
          </CardDescription>
        </div>
        <CardAction>
          <AvatarGroup
            label={`${title} reviewers`}
            max={3}
            members={members}
            reveal="names"
            size="sm"
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-[var(--dt-space-2)]">
          <StatusBadge icon={<CheckCircle2 />} tone="success">
            Ready
          </StatusBadge>
          <Badge size="xs" tone="neutral" variant="outline">
            {densityLabel}
          </Badge>
          <Badge icon={<Users />} size="xs" tone="primary" variant="subtle">
            4 reviewers
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export const OperationsSurface: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Light-mode suite surface combining identity rows, table cells, card headers, native labels, and AI metadata.",
      },
    },
  },
  render: () => (
    <DethinkProvider
      theme="light"
      className="bg-background text-foreground grid gap-[var(--dt-space-4)] p-[var(--dt-space-6)]"
    >
      <div className="grid gap-[var(--dt-space-4)] lg:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.75fr)]">
        <Card>
          <CardHeader>
            <div className="min-w-0">
              <CardTitle as="h2">Operational review queue</CardTitle>
              <CardDescription>
                Dense rows combine visible names, non-color-only status badges,
                and programmatic reviewer groups.
              </CardDescription>
            </div>
            <CardAction>
              <Badge icon={<Database />} tone="info" variant="outline">
                Registry smoke
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Table density="compact">
              <TableCaption placement="top">
                Identity labeling primitives in dense table cells.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operationsRows.map((row) => (
                  <TableRow key={row.workflow}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="text-foreground truncate font-medium">
                          {row.workflow}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {row.detail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PersonSummary
                        avatar={row.ownerAvatar}
                        badge={
                          row.owner === "Dethink Copilot" ? (
                            <Badge size="xs" tone="info" variant="subtle">
                              AI
                            </Badge>
                          ) : undefined
                        }
                        meta="Visible name makes the adjacent avatar decorative"
                        name={row.owner}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge icon={row.statusIcon} tone={row.tone}>
                        {row.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <AvatarGroup
                        label={`${row.workflow} reviewers`}
                        max={3}
                        members={row.members}
                        reveal="spread"
                        size="sm"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-[var(--dt-space-4)]">
          <ReviewCard
            densityLabel="Default density"
            members={reviewers}
            title="Release gate"
          />

          <Card>
            <CardHeader>
              <CardTitle as="h2">Routing form</CardTitle>
              <CardDescription>
                Standalone Label keeps native control activation while badges
                communicate validation state with text.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-[var(--dt-space-4)]">
                <div className="grid gap-[var(--dt-space-2)]">
                  <Label htmlFor="identity-owner" required>
                    Owner email
                  </Label>
                  <input
                    id="identity-owner"
                    className={nativeInputClasses}
                    required
                    defaultValue="ada@example.com"
                  />
                </div>
                <div className="grid gap-[var(--dt-space-2)]">
                  <Label htmlFor="identity-risk" invalid required>
                    Risk note
                  </Label>
                  <input
                    id="identity-risk"
                    aria-describedby="identity-risk-status"
                    aria-invalid="true"
                    className={nativeInputClasses}
                    required
                    defaultValue="Needs database review"
                  />
                  <Badge
                    id="identity-risk-status"
                    icon={<AlertTriangle />}
                    tone="warning"
                    variant="soft"
                  >
                    Human review required
                  </Badge>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DethinkProvider>
  ),
};

export const DarkCompactSurface: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Compact dark-mode operations view with the same primitives in denser spacing.",
      },
    },
  },
  render: () => (
    <DethinkProvider
      theme="dark"
      density="compact"
      className="bg-background text-foreground grid gap-[var(--dt-space-4)] p-[var(--dt-space-6)]"
    >
      <ReviewCard
        densityLabel="Compact density"
        members={operators}
        title="Incident bridge"
      />
      <div className="border-border grid gap-[var(--dt-density-gap)] rounded-lg border p-[var(--dt-space-4)]">
        {operationsRows.map((row) => (
          <div
            key={row.workflow}
            className="border-border grid gap-[var(--dt-space-3)] border-b pb-[var(--dt-space-3)] last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto]"
          >
            <PersonSummary
              avatar={row.ownerAvatar}
              badge={
                <StatusBadge icon={row.statusIcon} tone={row.tone}>
                  {row.status}
                </StatusBadge>
              }
              meta={row.detail}
              name={row.workflow}
            />
            <AvatarGroup
              label={`${row.workflow} compact reviewers`}
              max={3}
              members={row.members}
              motion="subtle"
              reveal="names"
              size="xs"
            />
          </div>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const HighContrastRtlSurface: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "High-contrast token override with RTL direction, visible labels, focusable reveal, and text-backed status.",
      },
    },
  },
  render: () => (
    <DethinkProvider
      theme="light"
      dir="rtl"
      style={highContrastStyle}
      className="bg-background text-foreground grid gap-[var(--dt-space-4)] p-[var(--dt-space-6)]"
    >
      <Card>
        <CardHeader>
          <div className="min-w-0">
            <CardTitle as="h2">RTL approval surface</CardTitle>
            <CardDescription>
              Logical spacing keeps avatar overlap, labels, and badges aligned
              when direction changes.
            </CardDescription>
          </div>
          <CardAction>
            <AvatarGroup
              label="RTL reviewers"
              max={3}
              members={reviewers}
              reveal="spread"
              ring="ring"
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid gap-[var(--dt-space-4)] sm:grid-cols-2">
            <div className="grid gap-[var(--dt-space-2)]">
              <Label htmlFor="identity-rtl-team" optional>
                Team label
              </Label>
              <input
                id="identity-rtl-team"
                className={nativeInputClasses}
                defaultValue="Platform operations"
              />
            </div>
            <div className="flex flex-wrap items-end gap-[var(--dt-space-2)]">
              <StatusBadge icon={<ShieldCheck />} tone="success">
                Approved
              </StatusBadge>
              <StatusBadge icon={<AlertTriangle />} tone="warning">
                2 policy checks
              </StatusBadge>
            </div>
          </div>
        </CardContent>
      </Card>
    </DethinkProvider>
  ),
};

export const NarrowAiMetadata: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Narrow AI/chat metadata layout where names remain visible and avatar reveal is not the only disclosure path.",
      },
    },
  },
  render: () => (
    <DethinkProvider
      theme="light"
      className="bg-background text-foreground max-w-[22rem] p-[var(--dt-space-4)]"
    >
      <article className="border-border grid gap-[var(--dt-space-4)] rounded-lg border p-[var(--dt-space-4)]">
        <header className="grid gap-[var(--dt-space-3)]">
          <PersonSummary
            avatar={
              <Avatar
                decorative
                fallbackIcon={<Bot />}
                name="Dethink Copilot"
                tone="info"
              />
            }
            badge={
              <Badge icon={<Sparkles />} size="xs" tone="info">
                AI draft
              </Badge>
            }
            meta="Tool call completed 2 min ago"
            name="Dethink Copilot"
          />
          <div className="flex flex-wrap items-center gap-[var(--dt-space-2)]">
            <Badge icon={<Cpu />} size="xs" tone="primary" variant="outline">
              gpt-5-review
            </Badge>
            <Badge icon={<Database />} size="xs" tone="neutral" variant="soft">
              registry metadata
            </Badge>
          </div>
        </header>
        <p className="text-muted-foreground text-sm">
          Suggested updating Badge, Label, Avatar, and AvatarGroup registry
          checks before publishing the identity-labeling suite.
        </p>
        <footer className="flex min-w-0 items-center justify-between gap-[var(--dt-space-3)]">
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-medium">
              Reviewers
            </p>
            <p className="text-muted-foreground truncate text-xs">
              Human names are also listed in the group description.
            </p>
          </div>
          <AvatarGroup
            label="AI message reviewers"
            max={2}
            members={aiReviewers}
            reveal="names"
            size="sm"
          />
        </footer>
        <div className="grid gap-[var(--dt-space-2)]">
          <Label htmlFor="identity-ai-follow-up" optional>
            Follow-up note
          </Label>
          <input
            id="identity-ai-follow-up"
            className={nativeInputClasses}
            placeholder="Add reviewer context"
          />
        </div>
      </article>
    </DethinkProvider>
  ),
};
