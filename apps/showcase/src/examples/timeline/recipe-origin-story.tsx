"use client";

import { Timeline, type TimelineItemData } from "@dethink/components";

type OriginMilestone = {
  year: string;
};

const originMilestones: TimelineItemData<OriginMilestone>[] = [
  {
    id: "transformer",
    title: "Attention changes the map",
    description:
      "The Transformer made attention the core primitive, giving language models a cleaner way to learn context at scale.",
    datetime: "2017-01-01T00:00:00Z",
    dateLabel: "2017",
    status: "complete",
    marker: <span className="font-mono text-[10px] font-bold">T</span>,
    data: { year: "2017" },
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
    data: { year: "2020" },
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
    data: { year: "2022" },
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
    data: { year: "2026" },
  },
];

export function TimelineRecipeOriginStory() {
  return (
    <Timeline<OriginMilestone>
      aria-label="Story of LLMs"
      items={originMilestones}
      mode="story"
    />
  );
}
