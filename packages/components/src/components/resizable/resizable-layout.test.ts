import { describe, it, expect } from "vitest";
import {
  parseResizableLayout,
  serializeResizableLayout,
} from "./resizable-layout";
describe("remembered pane layouts", () => {
  it("round trips a valid layout including a collapsed pane", () => {
    expect(
      parseResizableLayout(serializeResizableLayout({ nav: 0, main: 100 }), [
        "nav",
        "main",
      ]),
    ).toEqual({ nav: 0, main: 100 });
  });
  it.each([
    null,
    "bad json",
    "null",
    '{"version":2,"layout":{"nav":30,"main":70}}',
    '{"version":1,"layout":{"nav":-10,"main":110}}',
    '{"version":1,"layout":{"nav":"30","main":70}}',
    '{"version":1,"layout":{"nav":20,"main":20}}',
    '{"version":1,"layout":{"other":30,"main":70}}',
  ])("rejects corrupt or incompatible storage: %s", (value) =>
    expect(parseResizableLayout(value, ["nav", "main"])).toBeUndefined(),
  );
  it("rejects duplicate pane IDs and changed pane sets", () => {
    const data = serializeResizableLayout({ nav: 30, main: 70 });
    expect(parseResizableLayout(data, ["nav", "nav"])).toBeUndefined();
    expect(
      parseResizableLayout(data, ["nav", "main", "preview"]),
    ).toBeUndefined();
  });
});
