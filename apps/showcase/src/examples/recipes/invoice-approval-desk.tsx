"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  Check,
  CircleCheck,
  Clock3,
  FileText,
  Receipt,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Field,
  FieldControl,
  FieldLabel,
  Input,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

type InvoiceStatus = "pending" | "approved" | "changes";
type Decision = { status: InvoiceStatus; note?: string };
const statusLabels: Record<InvoiceStatus, string> = {
  pending: "Awaiting review",
  approved: "Approved",
  changes: "Changes requested",
};
const statusTones = {
  pending: "warning",
  approved: "success",
  changes: "info",
} as const;
const invoices = [
  {
    id: "INV-1042",
    vendor: "Form & Field",
    category: "Design partner",
    initials: "FF",
    owner: "Amelia Brooks",
    due: "24 Sep 2026",
    reference: "PO-0824",
    lines: [
      { description: "Product design retainer", quantity: 1, rate: 240000 },
      { description: "Illustration package", quantity: 1, rate: 65000 },
    ],
  },
  {
    id: "INV-1041",
    vendor: "Northline Cloud",
    category: "Infrastructure",
    initials: "NC",
    owner: "Theo Park",
    due: "25 Sep 2026",
    reference: "PO-0818",
    lines: [
      { description: "Compute and storage", quantity: 1, rate: 84000 },
      { description: "Team seats", quantity: 12, rate: 1500 },
    ],
  },
  {
    id: "INV-1040",
    vendor: "Sunday Studio",
    category: "Content production",
    initials: "SS",
    owner: "Mira Patel",
    due: "28 Sep 2026",
    reference: "PO-0812",
    lines: [
      { description: "Launch photography", quantity: 1, rate: 120000 },
      { description: "Image editing", quantity: 8, rate: 7500 },
    ],
  },
  {
    id: "INV-1039",
    vendor: "Common Ground",
    category: "Workspace",
    initials: "CG",
    owner: "Amelia Brooks",
    due: "30 Sep 2026",
    reference: "PO-0801",
    lines: [
      { description: "Studio membership", quantity: 4, rate: 22500 },
      { description: "Meeting room credits", quantity: 2, rate: 5000 },
    ],
  },
];
type Invoice = (typeof invoices)[number];
const initialDecisions: Record<string, Decision> = {
  "INV-1039": {
    status: "approved",
    note: "Matched to the workspace agreement.",
  },
};
const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});
const money = (cents: number) => currency.format(cents / 100);
const subtotal = (invoice: Invoice) =>
  invoice.lines.reduce((sum, line) => sum + line.quantity * line.rate, 0);
const total = (invoice: Invoice) =>
  subtotal(invoice) + Math.round(subtotal(invoice) * 0.2);

export function InvoiceApprovalDeskRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const [decisions, setDecisions] = useState(initialDecisions);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(invoices[0]!.id);
  const [action, setAction] = useState<"approved" | "changes">("approved");
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const statusFor = (invoice: Invoice) =>
    decisions[invoice.id]?.status ?? "pending";
  const pending = invoices.filter(
    (invoice) => statusFor(invoice) === "pending",
  );
  const approved = invoices.filter(
    (invoice) => statusFor(invoice) === "approved",
  );
  const filtered = invoices.filter(
    (invoice) =>
      (filter === "all" || statusFor(invoice) === filter) &&
      `${invoice.id} ${invoice.vendor}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const selected =
    filtered.find((invoice) => invoice.id === selectedId) ?? filtered[0];

  function review(next: "approved" | "changes") {
    setAction(next);
    setNote("");
    setError("");
    setOpen(true);
  }
  function reset() {
    setDecisions(initialDecisions);
    setQuery("");
    setFilter("all");
    setSelectedId(invoices[0]!.id);
    setAnnouncement("Demo reset. Three invoices await review.");
  }

  return (
    <section
      data-recipe-surface="invoice-approval-desk"
      className={`bg-background text-foreground ${presentation === "full-page" ? "min-h-[calc(100dvh-7rem)]" : "border-border overflow-hidden rounded-xl border"}`}
    >
      <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl">
            <Receipt className="size-4" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight">Ledger</span>
          <span className="text-muted-foreground hidden text-sm sm:inline">
            / Accounts payable
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">Acme Studio</Badge>
          <Avatar name="Amelia Brooks" size="sm" />
        </div>
      </header>
      <div className="space-y-7 p-5 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              A little order, a lot of clarity.
            </p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Good work. All accounted for.
            </h2>
            <p className="text-muted-foreground text-sm leading-6">
              Review the details, leave a clear decision, and keep things
              moving.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw />}
            onClick={reset}
          >
            Reset demo
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Awaiting review",
              value: String(pending.length).padStart(2, "0"),
              detail: "Invoices in your queue",
              icon: Clock3,
            },
            {
              label: "Pending amount",
              value: money(
                pending.reduce((sum, invoice) => sum + total(invoice), 0),
              ),
              detail: "Including VAT",
              icon: ArrowDownLeft,
            },
            {
              label: "Approved",
              value: String(approved.length).padStart(2, "0"),
              detail: "Ready for the finance team",
              icon: CircleCheck,
            },
          ].map((metric) => (
            <Card key={metric.label} shadow="none" className="gap-3 p-5">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>{metric.label}</span>
                <metric.icon className="size-4" aria-hidden />
              </div>
              <p className="text-2xl font-semibold tracking-tight tabular-nums">
                {metric.value}
              </p>
              <p className="text-muted-foreground text-xs">{metric.detail}</p>
            </Card>
          ))}
        </div>
        <p role="status" className="sr-only">
          {announcement}
        </p>
        <div className="grid items-start gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside aria-label="Invoice queue" className="min-w-0 space-y-4">
            <div className="relative">
              <Search
                className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                aria-label="Search invoices"
                placeholder="Search invoices…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="ps-9"
              />
            </div>
            <Select
              aria-label="Filter invoice status"
              value={filter}
              onValueChange={setFilter}
            >
              <SelectItem value="all">All invoices</SelectItem>
              <SelectItem value="pending">Awaiting review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="changes">Changes requested</SelectItem>
            </Select>
            <p className="text-muted-foreground text-xs" role="status">
              {filtered.length} {filtered.length === 1 ? "invoice" : "invoices"}
            </p>
            <div className="space-y-2">
              {filtered.map((invoice) => (
                <button
                  key={invoice.id}
                  type="button"
                  aria-pressed={selected?.id === invoice.id}
                  onClick={() => setSelectedId(invoice.id)}
                  className={`focus-visible:ring-ring focus-visible:ring-offset-background w-full rounded-xl border p-4 text-start outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:transition-colors ${selected?.id === invoice.id ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/40"}`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="bg-muted grid size-9 shrink-0 place-items-center rounded-lg text-xs font-semibold"
                    >
                      {invoice.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {invoice.vendor}
                      </span>
                      <span className="text-muted-foreground mt-1 block text-xs">
                        {invoice.id}
                      </span>
                    </span>
                  </span>
                  <span className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <Badge size="sm" tone={statusTones[statusFor(invoice)]}>
                      {statusLabels[statusFor(invoice)]}
                    </Badge>
                    <span className="text-sm font-medium tabular-nums">
                      {money(total(invoice))}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </aside>
          {selected ? (
            <Card shadow="none" className="min-w-0 gap-0 overflow-hidden">
              <div className="border-border flex flex-wrap items-start justify-between gap-4 border-b p-5 sm:p-6">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="text-primary size-4" aria-hidden />
                    <span className="text-muted-foreground font-mono text-xs">
                      {selected.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{selected.vendor}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {selected.category}
                  </p>
                </div>
                <Badge tone={statusTones[statusFor(selected)]}>
                  {statusLabels[statusFor(selected)]}
                </Badge>
              </div>
              <div className="space-y-6 p-5 sm:p-6">
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-muted-foreground text-xs">Due date</dt>
                    <dd className="mt-1.5 text-sm font-medium">
                      {selected.due}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">
                      Purchase order
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium">
                      {selected.reference}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Owner</dt>
                    <dd className="mt-1.5 flex items-center gap-2 text-sm">
                      <Avatar name={selected.owner} size="xs" decorative />
                      {selected.owner}
                    </dd>
                  </div>
                </dl>
                <Table aria-label={`Line items for ${selected.id}`}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-end">Qty</TableHead>
                      <TableHead className="text-end">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.lines.map((line) => (
                      <TableRow key={line.description}>
                        <TableCell className="min-w-36">
                          {line.description}
                        </TableCell>
                        <TableCell numeric>{line.quantity}</TableCell>
                        <TableCell numeric>
                          {money(line.quantity * line.rate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <dl className="ms-auto max-w-64 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tabular-nums">
                      {money(subtotal(selected))}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">VAT (20%)</dt>
                    <dd className="tabular-nums">
                      {money(Math.round(subtotal(selected) * 0.2))}
                    </dd>
                  </div>
                  <div className="border-border flex justify-between gap-4 border-t pt-3 font-semibold">
                    <dt>Total due</dt>
                    <dd className="text-lg tabular-nums">
                      {money(total(selected))}
                    </dd>
                  </div>
                </dl>
                {statusFor(selected) === "pending" ? (
                  <div className="bg-muted/40 flex items-start gap-3 rounded-xl p-4">
                    <ShieldCheck
                      className="text-primary mt-0.5 size-4 shrink-0"
                      aria-hidden
                    />
                    <div>
                      <p className="text-xs font-medium">
                        Ready for a human check
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs leading-5">
                        Review the purchase order and line items before
                        recording your decision.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-primary/5 rounded-xl p-4">
                    <p className="text-sm font-medium">
                      {statusLabels[statusFor(selected)]}
                    </p>
                    <p className="text-muted-foreground mt-2 text-sm leading-6 break-words">
                      {decisions[selected.id]?.note ||
                        "Reviewed and approved for the finance team."}
                    </p>
                  </div>
                )}
              </div>
              <div className="border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-t p-5 sm:px-6">
                <p className="text-muted-foreground text-xs">
                  Sample invoice · No payment is made.
                </p>
                {statusFor(selected) === "pending" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => review("changes")}
                    >
                      Request changes
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<Check />}
                      onClick={() => review("approved")}
                    >
                      Approve invoice
                    </Button>
                  </div>
                ) : (
                  <Badge variant="outline" icon={<Check />}>
                    Decision recorded
                  </Badge>
                )}
              </div>
            </Card>
          ) : (
            <EmptyState
              variant="card"
              title="No invoices found"
              description="Try another vendor name, invoice number, or status."
              visual={<Receipt />}
              primaryAction={
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
        <p className="text-muted-foreground border-border border-t pt-5 text-xs">
          Interactive demo · Sample invoices and local decisions. Changes reset
          on refresh.
        </p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dismissible showCloseButton size="sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!selected) return;
              if (action === "changes" && note.trim().length < 3) {
                setError(
                  "Add a short explanation so the owner knows what to change.",
                );
                return;
              }
              setDecisions((current) => ({
                ...current,
                [selected.id]: { status: action, note: note.trim() },
              }));
              setAnnouncement(`${selected.id}: ${statusLabels[action]}.`);
              setOpen(false);
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {action === "approved" ? "Approve invoice" : "Request changes"}
              </DialogTitle>
              <DialogDescription>
                {selected
                  ? `${selected.vendor} · ${selected.id} · ${money(total(selected))}`
                  : "Record your review."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 px-6 py-3">
              <Field>
                <FieldLabel>
                  {action === "changes"
                    ? "What needs to change?"
                    : "Review note (optional)"}
                </FieldLabel>
                <FieldControl asChild>
                  <Textarea
                    name="review-note"
                    required={action === "changes"}
                    maxLength={400}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error ? "invoice-review-error" : undefined
                    }
                    value={note}
                    onChange={(event) => {
                      setNote(event.target.value);
                      setError("");
                    }}
                    placeholder={
                      action === "changes"
                        ? "Explain the correction needed…"
                        : "Add context for the finance team…"
                    }
                  />
                </FieldControl>
                {error ? (
                  <p
                    id="invoice-review-error"
                    role="alert"
                    className="text-destructive text-sm"
                  >
                    {error}
                  </p>
                ) : null}
              </Field>
              <p className="text-muted-foreground text-xs leading-5">
                Your decision is saved locally in this demo. It does not send a
                message or initiate a payment.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {action === "approved"
                  ? "Confirm approval"
                  : "Record changes request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
