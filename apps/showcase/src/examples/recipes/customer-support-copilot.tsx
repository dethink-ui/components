"use client";

import { useState, type FormEvent } from "react";
import {
  Archive,
  AtSign,
  CheckCircle2,
  CircleDot,
  Clock3,
  Inbox,
  Mail,
  MessageCircle,
  MessageSquareText,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuLink,
  SidebarProvider,
  SidebarRail,
  SidebarSkipLink,
  Textarea,
} from "@dethink/components";
import type { RecipePreviewProps } from "@/lib/recipe-presentation";

type ConversationStatus = "Open" | "Pending" | "Resolved";
type ConversationPriority = "Priority" | "Standard";
type AvatarTone = "primary" | "info" | "success" | "warning";
type MessageSender = "agent" | "customer";

interface SupportMessage {
  id: string;
  author: string;
  body: string;
  dateTime: string;
  sender: MessageSender;
  time: string;
}

interface SupportConversation {
  id: string;
  channel: "Email" | "Chat";
  company: string;
  customer: string;
  messages: SupportMessage[];
  owner: string;
  preview: string;
  priority: ConversationPriority;
  status: ConversationStatus;
  subject: string;
  tone: AvatarTone;
  unread: number;
  updated: string;
}

const initialConversations: SupportConversation[] = [
  {
    id: "conv-avery",
    channel: "Email",
    company: "Northstar Labs",
    customer: "Avery Chen",
    messages: [
      {
        id: "avery-1",
        author: "Avery Chen",
        body: "Our workspace export has been processing since yesterday. The dashboard still says 42 percent and the download link has not appeared.",
        dateTime: "2026-07-09T09:42:00",
        sender: "customer",
        time: "9:42 AM",
      },
      {
        id: "avery-2",
        author: "Mira Patel",
        body: "I found the stalled export and restarted its final packaging step. I am checking the audit log before I send a fresh link.",
        dateTime: "2026-07-09T09:51:00",
        sender: "agent",
        time: "9:51 AM",
      },
      {
        id: "avery-3",
        author: "Avery Chen",
        body: "Thanks. We have a review in two hours, so a new link before then would be ideal.",
        dateTime: "2026-07-09T10:04:00",
        sender: "customer",
        time: "10:04 AM",
      },
    ],
    owner: "Mira Patel",
    preview: "We have a review in two hours, so a new link...",
    priority: "Priority",
    status: "Open",
    subject: "Workspace export is stuck",
    tone: "primary",
    unread: 2,
    updated: "4m",
  },
  {
    id: "conv-priya",
    channel: "Chat",
    company: "Veridian Health",
    customer: "Priya Shah",
    messages: [
      {
        id: "priya-1",
        author: "Priya Shah",
        body: "Can we restrict the new billing role so it can view invoices without changing the subscription?",
        dateTime: "2026-07-09T09:18:00",
        sender: "customer",
        time: "9:18 AM",
      },
      {
        id: "priya-2",
        author: "Mira Patel",
        body: "Yes. The Billing viewer role has invoice access without plan or payment permissions. I can share the setup steps.",
        dateTime: "2026-07-09T09:24:00",
        sender: "agent",
        time: "9:24 AM",
      },
    ],
    owner: "Mira Patel",
    preview: "Can we restrict the new billing role so it can...",
    priority: "Standard",
    status: "Pending",
    subject: "Billing role permissions",
    tone: "info",
    unread: 1,
    updated: "18m",
  },
  {
    id: "conv-jordan",
    channel: "Email",
    company: "Fieldnote",
    customer: "Jordan Kim",
    messages: [
      {
        id: "jordan-1",
        author: "Jordan Kim",
        body: "The SSO migration finished successfully. Everyone was able to sign in this morning.",
        dateTime: "2026-07-09T08:37:00",
        sender: "customer",
        time: "8:37 AM",
      },
      {
        id: "jordan-2",
        author: "Mira Patel",
        body: "Great news. I have marked the migration complete and left the fallback login active until Friday as agreed.",
        dateTime: "2026-07-09T08:44:00",
        sender: "agent",
        time: "8:44 AM",
      },
    ],
    owner: "Mira Patel",
    preview: "Everyone was able to sign in this morning.",
    priority: "Standard",
    status: "Resolved",
    subject: "SSO migration follow-up",
    tone: "success",
    unread: 0,
    updated: "1h",
  },
  {
    id: "conv-mateo",
    channel: "Chat",
    company: "Aperture Works",
    customer: "Mateo Silva",
    messages: [
      {
        id: "mateo-1",
        author: "Mateo Silva",
        body: "Two scheduled reports arrived with the previous date range after we changed the workspace timezone.",
        dateTime: "2026-07-09T07:46:00",
        sender: "customer",
        time: "7:46 AM",
      },
      {
        id: "mateo-2",
        author: "Mira Patel",
        body: "I reproduced the mismatch and attached it to the timezone fix. The next report will use the corrected range.",
        dateTime: "2026-07-09T08:02:00",
        sender: "agent",
        time: "8:02 AM",
      },
    ],
    owner: "Mira Patel",
    preview: "Two scheduled reports arrived with the previous date...",
    priority: "Priority",
    status: "Open",
    subject: "Scheduled report timezone",
    tone: "warning",
    unread: 0,
    updated: "2h",
  },
];

const statusMeta: Record<
  ConversationStatus,
  {
    icon: typeof CircleDot;
    tone: "neutral" | "success" | "warning";
  }
> = {
  Open: { icon: CircleDot, tone: "success" },
  Pending: { icon: Clock3, tone: "warning" },
  Resolved: { icon: CheckCircle2, tone: "neutral" },
};

function channelIcon(channel: SupportConversation["channel"]) {
  return channel === "Email" ? Mail : MessageCircle;
}

export function CustomerSupportCopilotRecipe({
  presentation = "embedded",
}: RecipePreviewProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0]!.id);
  const [reply, setReply] = useState("");
  const [replyAttempted, setReplyAttempted] = useState(false);
  const [replyStatus, setReplyStatus] = useState("");

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ??
    conversations[0]!;
  const totalUnread = conversations.reduce(
    (total, conversation) => total + conversation.unread,
    0,
  );
  const replyInvalid = replyAttempted && reply.trim().length === 0;
  const StatusIcon = statusMeta[selectedConversation.status].icon;
  const fullPage = presentation === "full-page";

  function selectConversation(id: string) {
    setSelectedId(id);
    setReply("");
    setReplyAttempted(false);
    setReplyStatus("");
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...conversation, unread: 0 } : conversation,
      ),
    );
  }

  function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = reply.trim();

    if (!body) {
      setReplyAttempted(true);
      setReplyStatus("");
      return;
    }

    const message: SupportMessage = {
      id: `${selectedConversation.id}-${selectedConversation.messages.length + 1}`,
      author: "Mira Patel",
      body,
      dateTime: "2026-07-09T10:12:00",
      sender: "agent",
      time: "Now",
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              messages: [...conversation.messages, message],
              preview: body,
              unread: 0,
              updated: "now",
            }
          : conversation,
      ),
    );
    setReply("");
    setReplyAttempted(false);
    setReplyStatus(
      `Reply added to ${selectedConversation.customer}'s conversation.`,
    );
  }

  return (
    <SidebarProvider variant="floating" motion="standard">
      <div
        data-recipe-surface="customer-support-copilot"
        className={`border-border bg-muted/25 flex overflow-hidden border ${
          fullPage
            ? "min-h-[calc(100dvh-7rem)] rounded-none border-x-0 border-t-0"
            : "min-h-[46rem] rounded-xl"
        }`}
      >
        <SidebarSkipLink targetId="support-inbox-main">
          Skip to selected conversation
        </SidebarSkipLink>

        <Sidebar aria-label="Support workspace" className="hidden lg:flex">
          <SidebarHeader>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="bg-primary/10 text-primary ring-primary/20 grid size-9 shrink-0 place-items-center rounded-lg ring-1"
                >
                  <Sparkles className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    Relay Copilot
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    Support workspace
                  </p>
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      active
                      badge={totalUnread > 0 ? totalUnread : undefined}
                      href="#conversation-queue"
                      icon={<Inbox aria-hidden="true" />}
                    >
                      Inbox
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      href="#message-history"
                      icon={<MessageSquareText aria-hidden="true" />}
                    >
                      Conversation
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      href="#reply-composer"
                      icon={<AtSign aria-hidden="true" />}
                    >
                      Reply
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      href="#conversation-queue"
                      icon={<Archive aria-hidden="true" />}
                    >
                      All conversations
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Team</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuLink
                      badge="4"
                      href="#conversation-queue"
                      icon={<Users aria-hidden="true" />}
                    >
                      Support team
                    </SidebarMenuLink>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar
                decorative
                name="Mira Patel"
                ring="border"
                size="sm"
                tone="success"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">Mira Patel</p>
                <p className="text-muted-foreground truncate text-[0.6875rem]">
                  Available
                </p>
              </div>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset
          id="support-inbox-main"
          tabIndex={-1}
          className="min-w-0 p-2 sm:p-3 lg:p-4"
        >
          <div className="border-border bg-background mb-2 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 lg:hidden">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className="bg-primary/10 text-primary ring-primary/20 grid size-8 shrink-0 place-items-center rounded-md ring-1"
              >
                <Sparkles className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Relay Copilot</p>
                <p className="text-muted-foreground truncate text-xs">
                  Support inbox
                </p>
              </div>
            </div>
            <Badge size="xs" tone="primary" variant="soft">
              {totalUnread} unread
            </Badge>
          </div>

          <div className="border-border bg-background grid min-h-[42rem] overflow-hidden rounded-xl border lg:h-[42rem] lg:grid-cols-[20rem_minmax(0,1fr)]">
            <aside
              id="conversation-queue"
              aria-labelledby="support-inbox-heading"
              className="border-border flex min-h-0 flex-col border-b lg:border-r lg:border-b-0"
            >
              <header className="border-border space-y-1 border-b px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <h2
                    id="support-inbox-heading"
                    className="font-heading text-lg font-semibold"
                  >
                    Inbox
                  </h2>
                  <Badge size="xs" tone="primary" variant="soft">
                    {totalUnread} unread
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs leading-5">
                  Customer conversations sorted by recent activity.
                </p>
              </header>

              <nav
                aria-labelledby="support-inbox-heading"
                className="max-h-80 overflow-y-auto p-2 lg:max-h-none lg:flex-1"
              >
                <ul className="space-y-1">
                  {conversations.map((conversation) => {
                    const selected =
                      conversation.id === selectedConversation.id;
                    const ChannelIcon = channelIcon(conversation.channel);
                    const ConversationStatusIcon =
                      statusMeta[conversation.status].icon;

                    return (
                      <li key={conversation.id}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          className={`focus-visible:ring-ring focus-visible:ring-offset-background grid min-h-24 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border px-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                            selected
                              ? "border-primary/45 bg-primary/8 shadow-sm"
                              : "hover:border-border hover:bg-muted/45 border-transparent"
                          }`}
                          onClick={() => selectConversation(conversation.id)}
                        >
                          <Avatar
                            decorative
                            name={conversation.customer}
                            ring={selected ? "ring" : "border"}
                            size="md"
                            tone={conversation.tone}
                          />
                          <span className="min-w-0 space-y-1">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="truncate text-sm font-semibold">
                                {conversation.customer}
                              </span>
                              {conversation.unread > 0 ? (
                                <Badge
                                  aria-label={`${conversation.unread} unread messages`}
                                  size="xs"
                                  tone="primary"
                                  variant="solid"
                                >
                                  {conversation.unread}
                                </Badge>
                              ) : null}
                            </span>
                            <span className="block truncate text-xs font-medium">
                              {conversation.subject}
                            </span>
                            <span className="text-muted-foreground block truncate text-xs">
                              {conversation.preview}
                            </span>
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
                              <span className="text-muted-foreground inline-flex items-center gap-1 text-[0.6875rem]">
                                <ChannelIcon
                                  aria-hidden="true"
                                  className="size-3"
                                />
                                {conversation.channel}
                              </span>
                              <span className="text-muted-foreground inline-flex items-center gap-1 text-[0.6875rem]">
                                <ConversationStatusIcon
                                  aria-hidden="true"
                                  className="size-3"
                                />
                                {conversation.status}
                              </span>
                              {conversation.priority === "Priority" ? (
                                <span className="text-warning text-[0.6875rem] font-semibold">
                                  Priority
                                </span>
                              ) : null}
                            </span>
                          </span>
                          <span className="text-muted-foreground text-[0.6875rem] tabular-nums">
                            {conversation.updated}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            <section
              aria-labelledby="selected-conversation-heading"
              className="flex min-h-[38rem] min-w-0 flex-col lg:min-h-0"
            >
              <header className="border-border flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    decorative
                    name={selectedConversation.customer}
                    ring="border"
                    size="lg"
                    tone={selectedConversation.tone}
                  />
                  <div className="min-w-0">
                    <h2
                      id="selected-conversation-heading"
                      className="font-heading truncate text-lg font-semibold"
                    >
                      {selectedConversation.subject}
                    </h2>
                    <p className="text-muted-foreground truncate text-sm">
                      {selectedConversation.customer} ·{" "}
                      {selectedConversation.company}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    icon={<StatusIcon />}
                    size="sm"
                    tone={statusMeta[selectedConversation.status].tone}
                    variant="soft"
                  >
                    {selectedConversation.status}
                  </Badge>
                  <Badge size="sm" tone="neutral" variant="outline">
                    Owner: {selectedConversation.owner}
                  </Badge>
                </div>
              </header>

              <div
                id="message-history"
                className="bg-muted/20 min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5"
              >
                {/* Tailwind removes list markers; keep Safari list semantics outside navigation. */}
                {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
                <ol
                  role="list"
                  aria-label={`Messages with ${selectedConversation.customer}`}
                  className="mx-auto max-w-3xl space-y-5"
                >
                  {selectedConversation.messages.map((message) => {
                    const fromAgent = message.sender === "agent";
                    const avatarName = fromAgent
                      ? "Mira Patel"
                      : selectedConversation.customer;

                    return (
                      <li
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          fromAgent ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar
                          decorative
                          name={avatarName}
                          ring="border"
                          size="sm"
                          tone={
                            fromAgent ? "success" : selectedConversation.tone
                          }
                        />
                        <div
                          className={`max-w-[min(36rem,82%)] min-w-0 ${
                            fromAgent ? "text-right" : ""
                          }`}
                        >
                          <div
                            className={`text-muted-foreground mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${
                              fromAgent ? "justify-end" : ""
                            }`}
                          >
                            <span className="text-foreground font-medium">
                              {message.author}
                            </span>
                            <span aria-hidden="true">·</span>
                            <time dateTime={message.dateTime}>
                              {message.time}
                            </time>
                          </div>
                          <p
                            className={`border-border text-foreground rounded-xl border px-3 py-2.5 text-left text-sm leading-6 shadow-sm ${
                              fromAgent
                                ? "bg-primary/8 rounded-tr-sm"
                                : "bg-background rounded-tl-sm"
                            }`}
                          >
                            {message.body}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <form
                id="reply-composer"
                className="border-border bg-background space-y-3 border-t p-4 sm:p-5"
                onSubmit={submitReply}
              >
                <Field id="support-reply" invalid={replyInvalid}>
                  <FieldLabel>
                    Reply to {selectedConversation.customer}
                  </FieldLabel>
                  <FieldControl asChild>
                    <Textarea
                      name="reply"
                      rows={3}
                      maxLength={600}
                      resize="vertical"
                      value={reply}
                      placeholder="Write a helpful response..."
                      onChange={(event) => {
                        setReply(event.target.value);
                        if (replyAttempted) {
                          setReplyAttempted(false);
                        }
                        if (replyStatus) {
                          setReplyStatus("");
                        }
                      }}
                    />
                  </FieldControl>
                  <FieldDescription id="support-reply-description">
                    Demo replies stay in this browser and reset on refresh.{" "}
                    {reply.length}/600 characters.
                  </FieldDescription>
                  {replyInvalid ? (
                    <FieldError id="support-reply-error" aria-live="polite">
                      Write a reply before sending.
                    </FieldError>
                  ) : null}
                </Field>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-muted-foreground text-xs">
                    Press Tab to reach Send reply.
                  </span>
                  <Button type="submit" rightIcon={<Send />}>
                    Send reply
                  </Button>
                </div>

                {replyStatus ? (
                  <output
                    aria-live="polite"
                    className="text-success block text-sm font-medium"
                  >
                    {replyStatus}
                  </output>
                ) : null}
              </form>
            </section>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
