import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVoiceRecorder } from ".";

class FakeRecorder extends EventTarget {
  static instances: FakeRecorder[] = [];
  static isTypeSupported = (type: string) => type.startsWith("audio/webm");
  state = "inactive";
  mimeType = "audio/webm";
  constructor() {
    super();
    FakeRecorder.instances.push(this);
  }
  start() {
    this.state = "recording";
  }
  pause() {
    this.state = "paused";
  }
  resume() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
  }
  finish(content = "audio") {
    const event = new Event("dataavailable");
    Object.defineProperty(event, "data", {
      value: new Blob([content], { type: this.mimeType }),
    });
    this.dispatchEvent(event);
    this.dispatchEvent(new Event("stop"));
  }
}
function media() {
  const track = new EventTarget() as EventTarget & {
    stop: ReturnType<typeof vi.fn>;
  };
  track.stop = vi.fn();
  return {
    track,
    stream: { getTracks: () => [track] } as unknown as MediaStream,
  };
}
const createURL = vi.fn(() => `blob:take-${Math.random()}`);
const revokeURL = vi.fn();
beforeEach(() => {
  vi.useFakeTimers();
  FakeRecorder.instances = [];
  createURL.mockClear();
  revokeURL.mockClear();
  vi.stubGlobal("MediaRecorder", FakeRecorder);
  vi.stubGlobal("URL", {
    createObjectURL: createURL,
    revokeObjectURL: revokeURL,
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useVoiceRecorder", () => {
  it("records one blob, excludes pauses, and releases tracks before finalization", () => {
    const { stream, track } = media();
    const onRecording = vi.fn();
    const onRelease = vi.fn();
    const { result } = renderHook(() =>
      useVoiceRecorder({ onRecording, onRelease }),
    );
    act(() => result.current.start(stream));
    act(() => vi.advanceTimersByTime(1200));
    act(() => result.current.pause());
    expect(result.current.state).toBe("paused");
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.elapsedMs).toBe(1200);
    act(() => result.current.resume());
    act(() => vi.advanceTimersByTime(800));
    act(() => result.current.stop());
    expect(result.current.state).toBe("finalizing");
    expect(track.stop).toHaveBeenCalledOnce();
    expect(onRelease).toHaveBeenCalledOnce();
    act(() => FakeRecorder.instances[0].finish());
    expect(result.current.state).toBe("ready");
    expect(result.current.recording).toMatchObject({
      durationMs: 2000,
      mimeType: "audio/webm",
      reason: "user",
    });
    expect(result.current.recording?.blob.size).toBeGreaterThan(0);
    expect(onRecording).toHaveBeenCalledOnce();
    act(() => FakeRecorder.instances[0].finish());
    expect(onRecording).toHaveBeenCalledOnce();
  });
  it("enforces the active duration cap across pause/resume", () => {
    const { stream } = media();
    const { result } = renderHook(() =>
      useVoiceRecorder({ maxDurationMs: 1000 }),
    );
    act(() => result.current.start(stream));
    act(() => vi.advanceTimersByTime(500));
    act(() => result.current.pause());
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.state).toBe("paused");
    act(() => result.current.resume());
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.state).toBe("finalizing");
    act(() => FakeRecorder.instances[0].finish());
    expect(result.current.recording).toMatchObject({
      reason: "duration-limit",
      durationMs: 1000,
    });
  });
  it.each(["discard", "unmount", "restart"])(
    "ignores late events after %s",
    (action) => {
      const { stream, track } = media();
      const onRecording = vi.fn();
      const { result, unmount } = renderHook(() =>
        useVoiceRecorder({ onRecording }),
      );
      act(() => result.current.start(stream));
      const old = FakeRecorder.instances[0];
      if (action === "unmount") unmount();
      else
        act(() =>
          action === "discard"
            ? result.current.discard()
            : result.current.start(media().stream),
        );
      act(() => old.finish());
      expect(onRecording).not.toHaveBeenCalled();
      expect(createURL).not.toHaveBeenCalled();
      expect(track.stop).toHaveBeenCalledOnce();
    },
  );
  it("revokes playback URLs on discard, replacement and unmount", () => {
    const { result, unmount } = renderHook(() => useVoiceRecorder());
    const record = () => {
      act(() => result.current.start(media().stream));
      act(() => result.current.stop());
      act(() => FakeRecorder.instances.at(-1)!.finish());
    };
    record();
    const first = result.current.recording!.url;
    act(() => result.current.discard());
    expect(revokeURL).toHaveBeenCalledWith(first);
    record();
    const second = result.current.recording!.url;
    record();
    expect(revokeURL).toHaveBeenCalledWith(second);
    const third = result.current.recording!.url;
    unmount();
    expect(revokeURL).toHaveBeenCalledWith(third);
  });
  it.each(["unsupported", "format", "limit", "start", "recorder"])(
    "releases resources on %s errors",
    (kind) => {
      const { stream, track } = media();
      const onRelease = vi.fn();
      const onError = vi.fn();
      if (kind === "unsupported") vi.stubGlobal("MediaRecorder", undefined);
      if (kind === "start")
        vi.spyOn(FakeRecorder.prototype, "start").mockImplementationOnce(() => {
          throw new Error("failure");
        });
      const { result } = renderHook(() =>
        useVoiceRecorder({
          onRelease,
          onError,
          mimeType: kind === "format" ? "invalid" : undefined,
          maxDurationMs: kind === "limit" ? -1 : undefined,
        }),
      );
      act(() => result.current.start(stream));
      if (kind === "recorder")
        act(() => FakeRecorder.instances[0].dispatchEvent(new Event("error")));
      expect(result.current.state).toBe("error");
      expect(track.stop).toHaveBeenCalledOnce();
      expect(onRelease).toHaveBeenCalledOnce();
      expect(onError).toHaveBeenCalledOnce();
    },
  );
  it("handles an externally ended track and empty recordings", () => {
    const { stream, track } = media();
    const { result } = renderHook(() => useVoiceRecorder());
    act(() => result.current.start(stream));
    act(() => track.dispatchEvent(new Event("ended")));
    act(() => FakeRecorder.instances[0].finish(""));
    expect(result.current.state).toBe("error");
    expect(result.current.recording).toBeNull();
    expect(createURL).not.toHaveBeenCalled();
  });
  it("uses the newest onRecording callback without interrupting a take", () => {
    const first = vi.fn();
    const latest = vi.fn();
    const { result, rerender } = renderHook(
      ({ onRecording }) => useVoiceRecorder({ onRecording }),
      { initialProps: { onRecording: first } },
    );
    act(() => result.current.start(media().stream));
    rerender({ onRecording: latest });
    act(() => result.current.stop());
    act(() => FakeRecorder.instances[0].finish());
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledOnce();
  });
});
