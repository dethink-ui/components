import { describe, expect, it } from "vitest";
import {
  centerTimelinePoint,
  fitTimelineTransform,
  getEdgeEnabledTimelineItemId,
  getNextEnabledTimelineItemId,
  getTimelineDatetimeAttribute,
  getTimelineDateValue,
  normalizeTimelineItems,
  normalizeViewportOptions,
  resetTimelineTransform,
  resolveTimelineScale,
  timelineGeometry,
  zoomTimelineTransform,
  type TimelineItemData,
} from ".";

const datedItems: TimelineItemData[] = [
  { id: "release", title: "Release", datetime: "2026-03-01T00:00:00Z" },
  { id: "kickoff", title: "Kickoff", datetime: "2026-01-01T00:00:00Z" },
  { id: "beta", title: "Beta", datetime: "2026-02-01T00:00:00Z" },
];

describe("Timeline utilities", () => {
  it("normalizes date values and datetime attributes", () => {
    const date = new Date("2026-01-01T12:00:00Z");

    expect(getTimelineDateValue("2026-01-01T00:00:00Z")).toBe(
      Date.parse("2026-01-01T00:00:00Z"),
    );
    expect(getTimelineDateValue("not-a-date")).toBeUndefined();
    expect(getTimelineDatetimeAttribute(date)).toBe("2026-01-01T12:00:00.000Z");
    expect(getTimelineDatetimeAttribute("2026-01-01")).toBe("2026-01-01");
  });

  it("resolves automatic scale to time only when every item has a valid date", () => {
    expect(resolveTimelineScale(datedItems, "auto")).toBe("time");
    expect(
      resolveTimelineScale(
        [
          { id: "a", title: "A", datetime: "2026-01-01" },
          { id: "b", title: "B" },
        ],
        "auto",
      ),
    ).toBe("sequence");
    expect(resolveTimelineScale(datedItems, "sequence")).toBe("sequence");
  });

  it("sorts event timelines by date and preserves progress input order", () => {
    expect(
      normalizeTimelineItems(datedItems, { mode: "events" }).map(
        (item) => item.id,
      ),
    ).toEqual(["kickoff", "beta", "release"]);

    expect(
      normalizeTimelineItems(datedItems, {
        mode: "events",
        order: "desc",
      }).map((item) => item.id),
    ).toEqual(["release", "beta", "kickoff"]);

    expect(
      normalizeTimelineItems(datedItems, { mode: "progress" }).map(
        (item) => item.id,
      ),
    ).toEqual(["release", "kickoff", "beta"]);
  });

  it("uses sequence positions when date scale is unavailable", () => {
    const normalized = normalizeTimelineItems(
      [
        { id: "first", title: "First" },
        { id: "second", title: "Second" },
      ],
      { mode: "progress", scale: "auto" },
    );

    expect(normalized[0].point.x).toBe(timelineGeometry.startPadding);
    expect(normalized[1].point.x).toBe(
      timelineGeometry.startPadding + timelineGeometry.itemGap,
    );

    const forcedTimeWithInvalidDate = normalizeTimelineItems(
      [
        { id: "valid", title: "Valid", datetime: "2026-01-01" },
        { id: "invalid", title: "Invalid", datetime: "not-a-date" },
      ],
      { mode: "events", scale: "time" },
    );

    expect(forcedTimeWithInvalidDate[1].point.x).toBe(
      timelineGeometry.startPadding + timelineGeometry.itemGap,
    );
  });

  it("preserves typed custom item payloads during normalization", () => {
    type DeploymentPayload = {
      service: string;
      owner: string;
      metadata: {
        risk: "low" | "medium" | "high";
      };
    };

    const normalized = normalizeTimelineItems<DeploymentPayload>(
      [
        {
          id: "deploy-api",
          status: "current",
          data: {
            service: "API",
            owner: "Platform",
            metadata: { risk: "medium" },
          },
        },
      ],
      { mode: "progress" },
    );

    expect(normalized[0].data?.service).toBe("API");
    expect(normalized[0].data?.metadata.risk).toBe("medium");
    expect(normalized[0].status).toBe("current");
  });

  it("keeps close time-scaled items visually separated", () => {
    const normalized = normalizeTimelineItems(
      [
        { id: "one", title: "One", datetime: "2026-01-01T00:00:00Z" },
        { id: "two", title: "Two", datetime: "2026-01-02T00:00:00Z" },
        { id: "three", title: "Three", datetime: "2026-03-01T00:00:00Z" },
      ],
      { mode: "events", scale: "time" },
    );

    expect(
      normalized[1].point.x - normalized[0].point.x,
    ).toBeGreaterThanOrEqual(timelineGeometry.minimumItemGap);
  });

  it("normalizes viewport zoom bounds", () => {
    expect(
      normalizeViewportOptions({ defaultZoom: 5, minZoom: 0.75, maxZoom: 2 })
        .defaultZoom,
    ).toBe(2);
    expect(
      normalizeViewportOptions({ defaultZoom: 0.1, minZoom: 0.75, maxZoom: 2 })
        .defaultZoom,
    ).toBe(0.75);
  });

  it("zooms around an origin and clamps to configured bounds", () => {
    expect(
      zoomTimelineTransform({
        transform: { x: 0, y: 0, zoom: 1 },
        delta: 0.5,
        minZoom: 0.5,
        maxZoom: 2,
        origin: { x: 100, y: 50 },
      }),
    ).toEqual({ x: -50, y: -25, zoom: 1.5 });

    expect(
      zoomTimelineTransform({
        transform: { x: 0, y: 0, zoom: 1 },
        delta: 5,
        minZoom: 0.5,
        maxZoom: 2,
      }).zoom,
    ).toBe(2);
  });

  it("computes reset, fit, and centering transforms", () => {
    expect(resetTimelineTransform({ defaultZoom: 1.25 })).toEqual({
      x: 0,
      y: 0,
      zoom: 1.25,
    });

    expect(
      fitTimelineTransform({
        contentSize: { width: 1000, height: 500 },
        viewportSize: { width: 500, height: 250 },
        minZoom: 0.25,
        maxZoom: 2,
      }),
    ).toEqual({ x: 0, y: 0, zoom: 0.5 });

    expect(
      centerTimelinePoint({
        point: { x: 200, y: 100 },
        viewportSize: { width: 800, height: 400 },
        zoom: 1,
      }),
    ).toEqual({ x: 200, y: 100, zoom: 1 });
  });

  it("finds enabled navigation targets", () => {
    const items = normalizeTimelineItems([
      { id: "one", title: "One" },
      { id: "two", title: "Two", disabled: true },
      { id: "three", title: "Three" },
    ]);

    expect(getNextEnabledTimelineItemId(items, null, 1)).toBe("one");
    expect(getNextEnabledTimelineItemId(items, "one", 1)).toBe("three");
    expect(getNextEnabledTimelineItemId(items, "three", -1)).toBe("one");
    expect(getEdgeEnabledTimelineItemId(items, "first")).toBe("one");
    expect(getEdgeEnabledTimelineItemId(items, "last")).toBe("three");
  });
});
