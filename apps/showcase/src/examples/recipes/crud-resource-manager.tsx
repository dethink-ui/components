"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  Building2,
  Edit3,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AsyncSelect,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  Field,
  FieldControl,
  FieldLabel,
  Form,
  Input,
  Select,
  SelectItem,
  ToastProvider,
  ToastViewport,
  useToast,
  type AsyncSelectItemData,
  type DataTableColumnDef,
} from "@dethink/components";

// ----------------------------------------------------------------------------
// Decorative layers (token-only, aria-hidden, non-interactive)
// ----------------------------------------------------------------------------

const washStyle: CSSProperties = {
  backgroundImage: [
    "radial-gradient(56% 42% at 0% 0%, color-mix(in oklab, var(--dt-color-primary) 12%, transparent), transparent 70%)",
    "radial-gradient(50% 40% at 100% 2%, color-mix(in oklab, var(--dt-color-info) 11%, transparent), transparent 72%)",
    "radial-gradient(64% 55% at 92% 108%, color-mix(in oklab, var(--dt-color-success) 9%, transparent), transparent 74%)",
    "linear-gradient(to bottom, color-mix(in oklab, var(--dt-color-foreground) 2.5%, transparent), transparent 30%)",
  ].join(", "),
};

// ----------------------------------------------------------------------------
// Domain data
// ----------------------------------------------------------------------------

type Account = {
  id: string;
  name: string;
  domain: string;
  owner: string;
  plan: "starter" | "growth" | "enterprise";
  status: "active" | "trial" | "paused";
};

const initialAccounts: Account[] = [
  {
    id: "acme",
    name: "Acme Operations",
    domain: "acme.io",
    owner: "Priya Shah",
    plan: "enterprise",
    status: "active",
  },
  {
    id: "northstar",
    name: "Northstar Systems",
    domain: "northstar.dev",
    owner: "Maya Chen",
    plan: "growth",
    status: "trial",
  },
  {
    id: "signal",
    name: "Signal Foundry",
    domain: "signalfoundry.com",
    owner: "Jon Bell",
    plan: "starter",
    status: "paused",
  },
  {
    id: "aperture",
    name: "Aperture Labs",
    domain: "aperture.science",
    owner: "Sam Rivera",
    plan: "enterprise",
    status: "active",
  },
  {
    id: "meridian",
    name: "Meridian Retail",
    domain: "meridian.store",
    owner: "Maya Chen",
    plan: "growth",
    status: "active",
  },
  {
    id: "lumen",
    name: "Lumen Health",
    domain: "lumenhealth.io",
    owner: "Priya Shah",
    plan: "starter",
    status: "trial",
  },
];

const owners: AsyncSelectItemData[] = [
  { label: "Priya Shah", value: "Priya Shah" },
  { label: "Maya Chen", value: "Maya Chen" },
  { label: "Jon Bell", value: "Jon Bell" },
  { label: "Sam Rivera", value: "Sam Rivera" },
];

const ownerTint: Record<string, string> = {
  "Priya Shah": "var(--dt-color-primary)",
  "Maya Chen": "var(--dt-color-info)",
  "Jon Bell": "var(--dt-color-warning)",
  "Sam Rivera": "var(--dt-color-success)",
};

const planMrr: Record<Account["plan"], number> = {
  starter: 290,
  growth: 990,
  enterprise: 2400,
};

const planMeta: Record<
  Account["plan"],
  { label: string; tint: string; pill: string }
> = {
  starter: {
    label: "Starter",
    tint: "var(--dt-color-muted-foreground)",
    pill: "bg-muted text-muted-foreground ring-border",
  },
  growth: {
    label: "Growth",
    tint: "var(--dt-color-info)",
    pill: "bg-info/15 text-info ring-info/25",
  },
  enterprise: {
    label: "Enterprise",
    tint: "var(--dt-color-primary)",
    pill: "bg-primary/15 text-primary ring-primary/25",
  },
};

const statusMeta: Record<
  Account["status"],
  { label: string; dot: string }
> = {
  active: { label: "Active", dot: "bg-success" },
  trial: { label: "Trial", dot: "bg-warning motion-safe:animate-pulse" },
  paused: { label: "Paused", dot: "bg-muted-foreground" },
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

function tintedAvatarStyle(tint: string): CSSProperties {
  return {
    backgroundColor: `color-mix(in oklab, ${tint} 18%, var(--dt-color-background))`,
  };
}

// ----------------------------------------------------------------------------
// Reusable presentational bits
// ----------------------------------------------------------------------------

function PlanPill({ plan }: { plan: Account["plan"] }) {
  const meta = planMeta[plan];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ring-1 ring-inset ${meta.pill}`}
    >
      {meta.label}
    </span>
  );
}

function StatusChip({ status }: { status: Account["status"] }) {
  const meta = statusMeta[status];
  return (
    <span className="text-foreground/90 inline-flex items-center gap-2 text-sm">
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 rounded-full ${meta.dot}`}
      />
      {meta.label}
    </span>
  );
}

// ----------------------------------------------------------------------------
// Create dialog
// ----------------------------------------------------------------------------

function CreateAccountDialog({
  onCreate,
}: {
  onCreate: (account: Account) => void;
}) {
  const [open, setOpen] = useState(false);
  const [ownerQuery, setOwnerQuery] = useState("");
  const ownerItems = useMemo(
    () =>
      owners.filter((owner) =>
        String(owner.label ?? "")
          .toLocaleLowerCase()
          .includes(ownerQuery.toLocaleLowerCase()),
      ),
    [ownerQuery],
  );

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "New account");
    const id = name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-");
    onCreate({
      id,
      name,
      domain: `${id.replace(/-/g, "")}.io`,
      owner: String(form.get("owner") ?? "Sam Rivera"),
      plan: String(form.get("plan") ?? "starter") as Account["plan"],
      status: "trial",
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Plus className="size-4" aria-hidden="true" />
        New account
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Create account</DialogTitle>
          <DialogDescription>
            A modal form uses the same field anatomy as the standalone form
            recipes.
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={submit} className="space-y-4 px-6 py-3">
          <div className="text-muted-foreground text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
            Company
          </div>
          <Field id="crud-name">
            <FieldLabel>Account name</FieldLabel>
            <FieldControl asChild>
              <Input name="name" placeholder="Umbrella Analytics" required />
            </FieldControl>
          </Field>
          <div className="text-muted-foreground pt-1 text-[0.7rem] font-semibold tracking-[0.14em] uppercase">
            Assignment
          </div>
          <AsyncSelect
            inputValue={ownerQuery}
            items={ownerItems}
            label="Owner"
            name="owner"
            onInputValueChange={setOwnerQuery}
            placeholder="Search owners"
          />
          <Select label="Plan" name="plan" defaultValue="growth">
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </Select>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" leftIcon={<Plus />}>
              Create
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------------
// Stat tiles
// ----------------------------------------------------------------------------

type Stat = {
  label: string;
  value: string;
  delta: string;
  deltaTone: "success" | "destructive";
  deltaDir: "up" | "down";
  tint: string;
};

function StatTile({ stat }: { stat: Stat }) {
  const deltaColor =
    stat.deltaTone === "success" ? "text-success" : "text-destructive";
  const DeltaIcon = stat.deltaDir === "up" ? TrendingUp : TrendingDown;
  return (
    <div
      className="border-border/70 bg-background/70 relative overflow-hidden rounded-lg border p-4 shadow-sm backdrop-blur motion-safe:transition-all motion-safe:duration-300 hover:shadow-md hover:motion-safe:-translate-y-0.5"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: stat.tint }}
      />
      <div className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
        {stat.label}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
          {stat.value}
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${deltaColor}`}
        >
          <DeltaIcon aria-hidden="true" className="size-3" />
          {stat.delta}
        </span>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Columns
// ----------------------------------------------------------------------------

function useColumns(
  onEdit: (account: Account) => void,
  onDelete: (account: Account) => void,
  onSync: (account: Account) => void,
) {
  return useMemo<DataTableColumnDef<Account>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Account",
        cell: ({ row }) => {
          const account = row.original;
          const tint = planMeta[account.plan].tint;
          return (
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="border-border/60 text-foreground/80 grid size-9 shrink-0 place-items-center rounded-lg border text-xs font-semibold"
                style={tintedAvatarStyle(tint)}
              >
                {initials(account.name)}
              </span>
              <span className="min-w-0">
                <span className="text-foreground block truncate text-sm font-medium">
                  {account.name}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {account.domain}
                </span>
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "owner",
        header: "Owner",
        cell: ({ row }) => {
          const name = row.original.owner;
          return (
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="border-border/60 text-foreground/80 grid size-6 shrink-0 place-items-center rounded-full border text-[0.6rem] font-semibold"
                style={tintedAvatarStyle(
                  ownerTint[name] ?? "var(--dt-color-primary)",
                )}
              >
                {initials(name)}
              </span>
              <span className="text-foreground/90 truncate text-sm">{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "plan",
        header: "Plan",
        cell: ({ row }) => <PlanPill plan={row.original.plan} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusChip status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${row.original.name}`}
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent placement="bottom end">
              <DropdownMenuSection>
                <DropdownMenuItem onAction={() => onEdit(row.original)}>
                  <DropdownMenuItemIcon aria-hidden="true">
                    <Edit3 />
                  </DropdownMenuItemIcon>
                  <DropdownMenuItemLabel>Edit</DropdownMenuItemLabel>
                </DropdownMenuItem>
                <DropdownMenuItem onAction={() => onSync(row.original)}>
                  <DropdownMenuItemIcon aria-hidden="true">
                    <RefreshCw />
                  </DropdownMenuItemIcon>
                  <DropdownMenuItemLabel>Sync</DropdownMenuItemLabel>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  destructive
                  onAction={() => onDelete(row.original)}
                >
                  <DropdownMenuItemIcon aria-hidden="true">
                    <Trash2 />
                  </DropdownMenuItemIcon>
                  <DropdownMenuItemLabel>Delete</DropdownMenuItemLabel>
                </DropdownMenuItem>
              </DropdownMenuSection>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onEdit, onDelete, onSync],
  );
}

// ----------------------------------------------------------------------------

function CrudWorkflow() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [editing, setEditing] = useState<Account | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Account | null>(null);

  const stats = useMemo<Stat[]>(() => {
    const total = accounts.length;
    const active = accounts.filter((a) => a.status === "active").length;
    const trialing = accounts.filter((a) => a.status === "trial").length;
    const mrr = accounts.reduce((sum, a) => sum + planMrr[a.plan], 0);
    return [
      {
        label: "Total accounts",
        value: String(total),
        delta: "+2",
        deltaTone: "success",
        deltaDir: "up",
        tint: "var(--dt-color-primary)",
      },
      {
        label: "Active",
        value: String(active),
        delta: "+1",
        deltaTone: "success",
        deltaDir: "up",
        tint: "var(--dt-color-success)",
      },
      {
        label: "Trialing",
        value: String(trialing),
        delta: "−1",
        deltaTone: "destructive",
        deltaDir: "down",
        tint: "var(--dt-color-warning)",
      },
      {
        label: "Monthly recurring",
        value: `$${(mrr / 1000).toFixed(1)}k`,
        delta: "+8.4%",
        deltaTone: "success",
        deltaDir: "up",
        tint: "var(--dt-color-info)",
      },
    ];
  }, [accounts]);

  const columns = useColumns(
    setEditing,
    setPendingDelete,
    (account) =>
      toast({
        title: "Sync queued",
        description: `${account.name} will refresh in the background.`,
        tone: "info",
      }),
  );

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        style={washStyle}
        className="pointer-events-none absolute -inset-x-6 -top-6 bottom-0 -z-10"
      />

      <div className="space-y-6">
        {/* Header band */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-muted-foreground inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
              <Sparkles className="text-primary size-3.5" aria-hidden="true" />
              Customer operations
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                Accounts
              </h2>
              <span className="border-border/70 bg-background/70 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur">
                <Users className="size-3.5" aria-hidden="true" />
                {accounts.length} in workspace
              </span>
            </div>
            <p className="text-muted-foreground max-w-xl text-sm leading-6">
              A local CRUD surface — create, edit, sync, and remove customer
              accounts with overlays, row actions, and announced feedback.
            </p>
          </div>
          <CreateAccountDialog
            onCreate={(account) => {
              setAccounts((current) => [account, ...current]);
              toast({
                title: "Account created",
                description: `${account.name} is ready for onboarding.`,
                tone: "success",
              });
            }}
          />
        </div>

        {/* Stat row */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatTile key={stat.label} stat={stat} />
          ))}
        </div>

        {/* Table card */}
        <Card
          shadow="sm"
          className="ring-border/60 relative overflow-hidden ring-1 backdrop-blur-sm"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="text-primary size-4" aria-hidden="true" />
              Customers
            </CardTitle>
            <CardDescription>
              DataTable handles filtering and pagination while row actions own
              record-specific flows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length > 0 ? (
              <DataTable
                columns={columns}
                data={accounts}
                getRowId={(row) => row.id}
                enableGlobalFilter
                globalFilterPlaceholder="Search accounts..."
                enablePagination
                defaultPagination={{ pageIndex: 0, pageSize: 5 }}
              />
            ) : (
              <EmptyState
                visual={<Search />}
                title="No accounts yet"
                description="Every customer you create lands here with owner, plan, and lifecycle status. Restore the sample workspace to explore the flows."
                primaryAction={
                  <Button
                    leftIcon={<RefreshCw />}
                    onClick={() => {
                      setAccounts(initialAccounts);
                      toast({
                        title: "Demo data restored",
                        description: "The example table has records again.",
                      });
                    }}
                  >
                    Restore demo data
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit drawer */}
      <Drawer
        open={Boolean(editing)}
        onOpenChange={(next) => {
          if (!next) setEditing(null);
        }}
        direction="right"
      >
        <DrawerContent size="md">
          <DrawerHeader>
            <DrawerTitle>Edit account</DrawerTitle>
            <DrawerDescription>
              Drawers keep dense editing flows close to the table context.
            </DrawerDescription>
          </DrawerHeader>

          {editing ? (
            <div className="space-y-5 px-6 py-3">
              {/* Account summary header */}
              <div className="border-border/70 bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
                <span
                  aria-hidden="true"
                  className="border-border/60 text-foreground/80 grid size-11 shrink-0 place-items-center rounded-lg border text-sm font-semibold"
                  style={tintedAvatarStyle(planMeta[editing.plan].tint)}
                >
                  {initials(editing.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-foreground truncate text-sm font-semibold">
                    {editing.name}
                  </div>
                  <div className="text-muted-foreground truncate text-xs">
                    {editing.domain}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <PlanPill plan={editing.plan} />
                  <StatusChip status={editing.status} />
                </div>
              </div>

              <Field id="crud-edit-owner">
                <FieldLabel>Owner</FieldLabel>
                <FieldControl asChild>
                  <Input value={editing.owner} readOnly />
                </FieldControl>
              </Field>
              <Select label="Status" defaultValue={editing.status}>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </Select>
            </div>
          ) : null}

          <DrawerFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (editing) {
                  toast({
                    title: "Changes saved",
                    description: `${editing.name} was updated.`,
                    tone: "success",
                  });
                }
                setEditing(null);
              }}
            >
              Save changes
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.name} will be removed from this local recipe.`
                : "This account will be removed from this local recipe."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (!pendingDelete) return;
                setAccounts((current) =>
                  current.filter((account) => account.id !== pendingDelete.id),
                );
                toast({
                  title: "Account deleted",
                  description: `${pendingDelete.name} was removed.`,
                  tone: "destructive",
                });
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function CrudResourceManagerRecipe() {
  return (
    <ToastProvider motion="standard">
      <CrudWorkflow />
      <ToastViewport />
    </ToastProvider>
  );
}
