import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import {
  Building2,
  CheckCircle2,
  GitPullRequest,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  AvatarGroup,
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
  type AvatarGroupMember,
  type AvatarGroupOverlap,
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
    metadata: "Architecture",
    name: "Maya Lin",
    src: images.maya,
    tone: "warning",
  },
  {
    metadata: "Security",
    name: "Alan Turing",
    tone: "info",
  },
  {
    metadata: "Analytics",
    name: "Katherine Johnson",
    src: images.katherine,
    tone: "destructive",
  },
];

const assignees: AvatarGroupMember[] = [
  { metadata: "Owner", name: "Priya Shah", tone: "primary" },
  { metadata: "Backend", name: "Mateo Garcia", tone: "success" },
  { metadata: "Design", name: "Nora Chen", tone: "warning" },
  { metadata: "QA", name: "Sam Rivera", tone: "info" },
];

const organizations: AvatarGroupMember[] = [
  {
    fallbackIcon: <Building2 />,
    metadata: "Enterprise",
    name: "Acme Operations",
    shape: "square",
    tone: "success",
  },
  {
    fallbackIcon: <Users />,
    metadata: "Workspace",
    name: "Platform Team",
    shape: "rounded",
    tone: "primary",
  },
  {
    fallbackIcon: <ShieldCheck />,
    metadata: "Security partner",
    name: "Northstar Audit",
    shape: "rounded",
    tone: "info",
  },
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

const meta = {
  title: "Components/AvatarGroup",
  component: AvatarGroup,
  args: {
    label: "Reviewers",
    max: 3,
    members: reviewers,
    overlap: "md",
    ring: "border",
    shape: "circle",
    size: "md",
  },
  argTypes: {
    overlap: {
      control: "inline-radio",
      options: ["none", "sm", "md", "lg"],
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
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const overlaps: AvatarGroupOverlap[] = ["none", "sm", "md", "lg"];

const tableRows: Array<{
  members: AvatarGroupMember[];
  name: string;
  status: "Ready" | "Reviewing" | "Queued";
}> = [
  { members: assignees.slice(0, 2), name: "Billing export", status: "Ready" },
  {
    members: reviewers.slice(0, 4),
    name: "Registry smoke",
    status: "Reviewing",
  },
  { members: reviewers, name: "Access policy", status: "Queued" },
];

const assigneeRows: Array<{
  label: string;
  members: AvatarGroupMember[];
  status: "Critical" | "Active" | "Ready";
}> = [
  { label: "Incident response", members: assignees, status: "Critical" },
  {
    label: "Usage dashboard",
    members: assignees.slice(0, 3),
    status: "Active",
  },
  {
    label: "Invoice review",
    members: assignees.slice(1, 3),
    status: "Ready",
  },
];

function ClusterRow({
  label,
  members,
  meta,
  status,
}: {
  label: string;
  members: AvatarGroupMember[];
  meta: string;
  status: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-[var(--dt-space-4)]">
      <div className="min-w-0">
        <p className="text-foreground truncate text-sm font-medium">{label}</p>
        <p className="text-muted-foreground truncate text-xs">{meta}</p>
      </div>
      <div className="flex shrink-0 items-center gap-[var(--dt-space-3)]">
        <AvatarGroup label={`${label} members`} max={3} members={members} />
        <Badge size="xs" tone="success">
          {status}
        </Badge>
      </div>
    </div>
  );
}

export const Base: Story = {};

export const TwoPersonGroup: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border flex max-w-md items-center justify-between rounded-lg border p-6"
    >
      <div>
        <p className="text-foreground text-sm font-medium">Launch review</p>
        <p className="text-muted-foreground text-xs">Ada and Grace</p>
      </div>
      <AvatarGroup
        label="Launch reviewers"
        max={2}
        members={reviewers.slice(0, 2)}
      />
    </DethinkProvider>
  ),
};

export const LargerGroupWithOverflow: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border grid max-w-2xl gap-5 rounded-lg border p-6"
    >
      <div className="flex flex-wrap items-center gap-[var(--dt-space-5)]">
        {overlaps.map((overlap) => (
          <div key={overlap} className="grid justify-items-center gap-2">
            <AvatarGroup
              label={`${overlap} overlap reviewers`}
              max={3}
              members={reviewers}
              overlap={overlap}
              overflowLabel={({ count }) => `${count} more reviewers`}
            />
            <span className="text-muted-foreground text-xs">{overlap}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-[var(--dt-space-4)]">
        <div>
          <p className="text-foreground text-sm font-medium">Security audit</p>
          <p className="text-muted-foreground text-xs">
            Five reviewers across security and runtime
          </p>
        </div>
        <AvatarGroup
          label="Security audit reviewers"
          max={2}
          members={reviewers}
          overflowLabel={({ count }) => `${count} more reviewers`}
          ring="ring"
        />
      </div>
    </DethinkProvider>
  ),
};

export const CompactTableCells: Story = {
  render: () => (
    <DethinkProvider
      density="compact"
      theme="light"
      className="border-border max-w-4xl rounded-lg border p-4"
    >
      <Table density="compact">
        <TableHeader>
          <TableRow>
            <TableHead>Request</TableHead>
            <TableHead>Owners</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableRows.map(({ members: rowMembers, name, status }) => (
            <TableRow key={name}>
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell>
                <AvatarGroup
                  label={`${name} owners`}
                  max={3}
                  members={rowMembers}
                  overlap="sm"
                  size="xs"
                />
              </TableCell>
              <TableCell>
                <Badge size="xs" tone={status === "Ready" ? "success" : "info"}>
                  {status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DethinkProvider>
  ),
};

export const ReviewerClusters: Story = {
  render: () => (
    <DethinkProvider theme="light" className="grid max-w-3xl gap-4">
      <Card>
        <CardHeader>
          <CardTitle as="h2">Pull requests</CardTitle>
          <CardDescription>
            Review load for the current milestone.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ClusterRow
            label="Registry install smoke"
            members={reviewers}
            meta="5 reviewers"
            status="Passing"
          />
          <ClusterRow
            label="Dense table polish"
            members={reviewers.slice(1)}
            meta="4 reviewers"
            status="Passing"
          />
          <ClusterRow
            label="Identity recipes"
            members={reviewers.slice(0, 3)}
            meta="3 reviewers"
            status="Passing"
          />
        </CardContent>
      </Card>
    </DethinkProvider>
  ),
};

export const AssigneeLists: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border grid max-w-2xl gap-4 rounded-lg border p-6"
    >
      {assigneeRows.map(({ label, members: rowMembers, status }) => (
        <div
          key={label}
          className="flex items-center justify-between gap-[var(--dt-space-4)]"
        >
          <div className="flex min-w-0 items-center gap-[var(--dt-space-3)]">
            <GitPullRequest className="text-muted-foreground size-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-foreground truncate text-sm font-medium">
                {label}
              </p>
              <p className="text-muted-foreground text-xs">
                {rowMembers.length} assignees
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-[var(--dt-space-3)]">
            <AvatarGroup
              label={`${label} assignees`}
              max={3}
              members={rowMembers}
            />
            <Badge
              size="xs"
              tone={status === "Critical" ? "destructive" : "primary"}
            >
              {status}
            </Badge>
          </div>
        </div>
      ))}
    </DethinkProvider>
  ),
};

export const OrganizationAvatars: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border grid max-w-lg gap-5 rounded-lg border p-6"
    >
      <div className="flex items-center justify-between gap-[var(--dt-space-4)]">
        <div>
          <p className="text-foreground text-sm font-medium">Account owners</p>
          <p className="text-muted-foreground text-xs">
            Teams and organizations
          </p>
        </div>
        <AvatarGroup
          label="Account organizations"
          max={3}
          members={organizations}
          shape="rounded"
        />
      </div>
      <div className="flex flex-wrap gap-[var(--dt-space-2)]">
        {organizations.map((organization) => (
          <Badge key={organization.name} icon={<CheckCircle2 />} size="xs">
            {organization.name}
          </Badge>
        ))}
      </div>
    </DethinkProvider>
  ),
};

export const ThemeDensityAndContrast: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <DethinkProvider
        theme="dark"
        className="border-border bg-background grid gap-4 rounded-lg border p-6"
      >
        <p className="text-foreground text-sm font-medium">Nightly reviewers</p>
        <AvatarGroup label="Nightly reviewers" max={3} members={reviewers} />
      </DethinkProvider>
      <DethinkProvider
        density="compact"
        theme="light"
        className="border-border grid gap-4 rounded-lg border p-6"
      >
        <p className="text-foreground text-sm font-medium">Compact owners</p>
        <AvatarGroup
          label="Compact owners"
          max={3}
          members={assignees}
          overlap="sm"
          size="xs"
        />
      </DethinkProvider>
      <DethinkProvider
        theme="light"
        style={highContrastStyle}
        className="border-border grid gap-4 rounded-lg border p-6"
      >
        <p className="text-foreground text-sm font-medium">
          Contrast reviewers
        </p>
        <AvatarGroup
          label="Contrast reviewers"
          max={3}
          members={reviewers}
          ring="ring"
        />
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
      <div className="flex items-center justify-between gap-[var(--dt-space-4)]">
        <div className="text-right">
          <p className="text-foreground text-sm font-medium">
            RTL review queue
          </p>
          <p className="text-muted-foreground text-xs">
            Logical overlap keeps the stack aligned
          </p>
        </div>
        <AvatarGroup
          dir="rtl"
          label="RTL reviewers"
          max={3}
          members={reviewers}
          overlap="lg"
        />
      </div>
    </DethinkProvider>
  ),
};

export const TouchSafeNonHoverUsage: Story = {
  render: () => (
    <DethinkProvider
      theme="light"
      className="border-border grid max-w-2xl gap-5 rounded-lg border p-6"
    >
      <div className="flex items-center justify-between gap-[var(--dt-space-4)]">
        <div>
          <p className="text-foreground text-sm font-medium">
            Production deploy
          </p>
          <p className="text-muted-foreground text-xs">
            Identity list is visible
          </p>
        </div>
        <AvatarGroup label="Deploy reviewers" max={3} members={reviewers} />
      </div>
      <ul className="grid gap-2">
        {reviewers.map((member) => (
          <li
            key={member.name}
            className="flex items-center justify-between gap-[var(--dt-space-3)]"
          >
            <span className="text-foreground text-sm">{member.name}</span>
            <Badge size="xs">{member.metadata}</Badge>
          </li>
        ))}
      </ul>
    </DethinkProvider>
  ),
};
