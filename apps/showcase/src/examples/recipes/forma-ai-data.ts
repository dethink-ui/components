export const formaAgents = [
  {
    id: "research",
    name: "Research",
    role: "Your curiosity, amplified.",
    description:
      "Turn scattered information into a clear next step. A research partner that brings the context with the answer.",
    tags: ["Discover", "Compare", "Synthesize"],
    input: "Compare three approaches to a customer onboarding journey.",
    source: "Product team · Research brief",
    stages: [
      "Read the brief",
      "Compare the evidence",
      "Prepare a recommendation",
    ],
    outputTitle: "A clearer path to the first win",
    output:
      "Start with a guided checklist, introduce one useful action at a time, and keep help within reach. Test the first-session experience with a small group before rolling it out.",
    evidence: [
      "Sample interview notes",
      "Sample journey map",
      "Sample support themes",
    ],
    detail:
      "Combine your knowledge base, documents and a specific question. Get a structured brief with source references and a clear distinction between evidence and inference.",
    boundary:
      "A person reviews the recommendation before it becomes a decision.",
  },
  {
    id: "support",
    name: "Support",
    role: "A little more human, at scale.",
    description:
      "Give every conversation a thoughtful starting point. Find context, draft a useful reply, and know when to bring in a person.",
    tags: ["Understand", "Draft", "Escalate"],
    input: "A customer needs help inviting their first teammate.",
    source: "Support inbox · New conversation",
    stages: [
      "Understand the request",
      "Find the right guidance",
      "Draft a helpful reply",
    ],
    outputTitle: "A helpful reply, ready for your voice",
    output:
      "You can invite a teammate from Workspace → Members → Invite. Add their email, choose a role, and send the invitation. If it does not arrive, check the address and resend it from the same page.",
    evidence: [
      "Sample member guide",
      "Sample conversation",
      "Sample escalation policy",
    ],
    detail:
      "Ground answers in your own help content, preserve the conversation context and route sensitive or unfamiliar requests to your team.",
    boundary:
      "Drafts stay in review. Nothing is sent to a customer by this demo.",
  },
  {
    id: "operations",
    name: "Operations",
    role: "Keep the work moving.",
    description:
      "Bring order to the handoffs. Summarize what changed, find the owner, and prepare the next action across your tools.",
    tags: ["Organize", "Route", "Follow up"],
    input: "Prepare a project handoff from the latest team update.",
    source: "Team workspace · Weekly update",
    stages: [
      "Read the latest update",
      "Identify owners and actions",
      "Prepare the handoff",
    ],
    outputTitle: "The next step has an owner",
    output:
      "Design will review the revised onboarding screens. Engineering will confirm the implementation scope. The project lead will bring open questions to the next planning session.",
    evidence: [
      "Sample team update",
      "Sample project board",
      "Sample ownership map",
    ],
    detail:
      "Connect everyday updates with the right owner and next action. Make handoffs visible, keep a readable history, and leave the final approval with your team.",
    boundary:
      "No external task is created or updated. Approvals complete only this sample run.",
  },
] as const;
export type FormaAgent = (typeof formaAgents)[number];
export type FormaAgentId = FormaAgent["id"];

export const formaEngagements = [
  {
    id: "discovery",
    label: "Discovery",
    heading: "Find your highest-value starting point.",
    duration: "A focused first step",
    description:
      "We map the work, ask better questions, and turn an ambitious idea into a practical plan.",
    deliverables: [
      "Workflow and opportunity mapping",
      "Use-case prioritization",
      "Technical and data review",
      "A clear prototype brief",
    ],
  },
  {
    id: "build",
    label: "Build",
    heading: "Make the possibility tangible.",
    duration: "From prototype to practice",
    description:
      "A small, focused team designs, builds and tests an agent around one meaningful outcome.",
    deliverables: [
      "A working agent or automation",
      "Connections to your existing tools",
      "Human review and recovery paths",
      "Team walkthrough and handover",
    ],
  },
  {
    id: "partner",
    label: "Partner",
    heading: "Keep making the system better.",
    duration: "An ongoing collaboration",
    description:
      "Learn from the people using it. Refine the experience, measure what matters, and grow thoughtfully.",
    deliverables: [
      "A shared improvement roadmap",
      "Regular quality and workflow reviews",
      "New capabilities as needs evolve",
      "Support for your internal team",
    ],
  },
] as const;
export type FormaEngagementId = (typeof formaEngagements)[number]["id"];

export const formaFaq = [
  [
    "What does Forma build?",
    "AI agents and automations designed around a team's real work: research, customer support, internal operations and the handoffs between tools. This is a fictional studio website and all demonstrations run locally.",
  ],
  [
    "Can we start with one use case?",
    "Yes. Start with a focused question and a useful outcome. The Discovery engagement is designed to clarify the workflow, data and review points before a build.",
  ],
  [
    "Will this work with our existing tools?",
    "A real engagement would assess your systems, API access and data requirements first. The integrations here show representative categories; selecting one explains its role without connecting an account.",
  ],
  [
    "Where do people stay in the loop?",
    "At the decisions that matter. The agent lab demonstrates an explicit review step: the output waits for approval before the sample run completes. A production system would define permissions, escalation and recovery for each action.",
  ],
  [
    "How do we get started?",
    "Choose an engagement and open a project brief. The form validates locally and shows a summary, but does not send your information or create an account. It is a working interface example, not a real sales channel.",
  ],
] as const;
