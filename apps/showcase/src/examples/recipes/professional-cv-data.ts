import type { TimelineItemData } from "@dethink/components";

export const cvExperience: TimelineItemData[] = [
  {
    id: "independent",
    dateLabel: "2023 — Now",
    title: "Independent product designer",
    description:
      "Partnering with ambitious teams to make complex digital products feel wonderfully simple.",
    status: "current",
  },
  {
    id: "chapter",
    dateLabel: "2020 — 2023",
    title: "Senior designer · Chapter",
    description:
      "Led product design across a growing suite of tools for creative teams. Built a shared design system with engineering.",
    status: "complete",
  },
  {
    id: "north",
    dateLabel: "2017 — 2020",
    title: "Product designer · North Studio",
    description:
      "From early research to the last pixel: digital experiences for thoughtful brands and early-stage businesses.",
    status: "complete",
  },
];

export const cvSkills = [
  "Product strategy",
  "User research",
  "Interaction design",
  "Design systems",
  "Art direction",
  "Prototyping",
  "Accessibility",
  "Creative development",
];

export const cvTestimonials = [
  {
    id: "jamie",
    name: "Jamie Ellis",
    role: "Co-founder, Chapter",
    quote:
      "Alex has that rare ability to make a complicated problem feel simple — and the final result feel inevitable.",
  },
  {
    id: "maya",
    name: "Maya Chen",
    role: "Creative director, Still",
    quote:
      "Every detail had a reason. Alex gave our brand a quiet confidence, then carried it beautifully into the digital experience.",
  },
  {
    id: "sam",
    name: "Sam Rivera",
    role: "Product lead, Fieldnotes",
    quote:
      "A generous collaborator with a sharp eye. Alex brought clarity to the messy middle and helped our whole team move forward.",
  },
  {
    id: "robin",
    name: "Robin Park",
    role: "Engineering lead, North Studio",
    quote:
      "The handoff felt like a conversation, not a finish line. Thoughtful systems, clear decisions, and real care for the people using them.",
  },
];

export const cvProjects = [
  {
    id: "still",
    title: "Still",
    category: "Brand",
    year: "2026",
    subtitle: "A quieter kind of everyday ritual.",
    image: "still.webp",
    alt: "Still wellness packaging and an ivory bottle beside a lavender glass disc",
    role: "Brand strategy · Art direction · E-commerce",
    overview:
      "A considered identity and shopping experience for a new generation of everyday essentials. The brief was simple: make less feel like more.",
    challenge:
      "Wellness shopping can be overwhelming. Still needed a clear story and an approachable way to understand each product without a wall of claims.",
    approach:
      "We organised the range around daily rituals, paired restrained typography with tactile imagery, and prototyped a guided discovery flow. A shared component system kept the shop consistent from product discovery to checkout.",
    outcome:
      "A cohesive launch concept spanning identity, packaging and a responsive storefront. Clear product comparisons and an accessible purchase flow brought the quiet visual language into the interaction design.",
    deliverables: [
      "Visual identity",
      "Responsive storefront",
      "Component system",
    ],
  },
  {
    id: "fieldnotes",
    title: "Fieldnotes",
    category: "Digital",
    year: "2025",
    subtitle: "More getting lost. Less endless scrolling.",
    image: "fieldnotes.webp",
    alt: "Fieldnotes travel journal with coastal photography on a forest green desk",
    role: "Research · Product design · Prototyping",
    overview:
      "A digital companion for people who travel with curiosity. Fieldnotes connects beautifully told local stories with a practical place to plan a trip.",
    challenge:
      "Inspiration lived in one place, saved links in another, and the actual plan in a spreadsheet. Travellers needed a calmer bridge from dreaming to doing.",
    approach:
      "We mapped the planning journey, tested a collection-first information architecture, and designed accessible map/list alternatives. Editorial pacing gives each destination room to breathe.",
    outcome:
      "An end-to-end product concept with a reusable editorial system, organised trip collections and a focused mobile itinerary. The final prototype connects discovery, saving and planning in one coherent journey.",
    deliverables: [
      "Discovery research",
      "Mobile experience",
      "Interactive prototype",
    ],
  },
] as const;
