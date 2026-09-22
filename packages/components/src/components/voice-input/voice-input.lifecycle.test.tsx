import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef, StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VoiceInput, type VoiceInputController } from ".";

class Track extends EventTarget {
  enabled = true;
  readyState = "live";
  stop = vi.fn(() => {
    this.readyState = "ended";
  });
}
function media() {
  const track = new Track();
  const stream = {
    getTracks: () => [track],
    getAudioTracks: () => [track],
  } as unknown as MediaStream;
  return { stream, track };
}
function pending() {
  let resolve!: (stream: MediaStream) => void;
  const getUserMedia = vi.fn(
    () =>
      new Promise<MediaStream>((done) => {
        resolve = done;
      }),
  );
  return { getUserMedia, resolve: (stream: MediaStream) => resolve(stream) };
}
afterEach(() => vi.unstubAllGlobals());

describe("VoiceInput session ownership", () => {
  it("applies the latest mute value before delivering a pending stream", async () => {
    const request = pending();
    const { stream, track } = media();
    const onStream = vi.fn(() => expect(track.enabled).toBe(false));
    const { rerender } = render(
      <VoiceInput getUserMedia={request.getUserMedia} onStream={onStream} />,
    );
    fireEvent.click(screen.getByRole("button"));
    rerender(
      <VoiceInput
        muted
        getUserMedia={request.getUserMedia}
        onStream={onStream}
      />,
    );
    await act(async () => request.resolve(stream));
    expect(onStream).toHaveBeenCalledOnce();
    expect(screen.getByRole("button")).toHaveAttribute("data-state", "muted");
  });
  it.each(["cancel", "disabled", "unmount"])(
    "releases late streams after %s without publishing",
    async (action) => {
      const request = pending();
      const { stream, track } = media();
      const onStream = vi.fn();
      const controllerRef = createRef<VoiceInputController>();
      const props = {
        getUserMedia: request.getUserMedia,
        onStream,
        controllerRef,
      };
      const { rerender, unmount } = render(<VoiceInput {...props} />);
      fireEvent.click(screen.getByRole("button"));
      if (action === "disabled") rerender(<VoiceInput {...props} disabled />);
      else if (action === "unmount") unmount();
      else act(() => controllerRef.current?.cancel());
      await act(async () => request.resolve(stream));
      expect(onStream).not.toHaveBeenCalled();
      expect(track.stop).toHaveBeenCalledOnce();
    },
  );
  it("uses current callbacks on external track end without re-notifying on prop changes", async () => {
    const { stream, track } = media();
    const oldStop = vi.fn();
    const newStop = vi.fn();
    const state = vi.fn();
    const { rerender } = render(
      <VoiceInput getUserMedia={async () => stream} onStop={oldStop} />,
    );
    fireEvent.click(screen.getByRole("button"));
    await screen.findByRole("button", { name: "Stop voice input" });
    rerender(
      <VoiceInput
        getUserMedia={async () => stream}
        onStop={newStop}
        onStateChange={state}
      />,
    );
    expect(state).not.toHaveBeenCalled();
    act(() => track.dispatchEvent(new Event("ended")));
    expect(oldStop).not.toHaveBeenCalled();
    expect(newStop).toHaveBeenCalledWith(stream, "track-ended");
    expect(state).toHaveBeenCalledExactlyOnceWith("idle");
  });
  it.each(["onStream", "onStateChange"])(
    "releases tracks when %s throws without claiming permission denial",
    async (callback) => {
      const { stream, track } = media();
      const onError = vi.fn();
      const onStop = vi.fn();
      const crash = () => {
        throw new Error("Consumer failure");
      };
      render(
        <VoiceInput
          getUserMedia={async () => stream}
          onError={onError}
          onStop={onStop}
          onStream={callback === "onStream" ? crash : undefined}
          onStateChange={
            callback === "onStateChange"
              ? (state) => {
                  if (state === "recording") crash();
                }
              : undefined
          }
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      await waitFor(() =>
        expect(screen.getByRole("button")).toHaveAttribute(
          "data-state",
          "error",
        ),
      );
      expect(track.stop).toHaveBeenCalledOnce();
      expect(onStop).toHaveBeenCalledExactlyOnceWith(stream, "error");
      expect(onError).toHaveBeenCalledWith(expect.any(Error), "error");
    },
  );
  it("can cancel permission with the same button and start a new request", async () => {
    const first = pending();
    const second = media();
    const late = media();
    const getUserMedia = vi
      .fn()
      .mockImplementationOnce(first.getUserMedia)
      .mockResolvedValueOnce(second.stream);
    render(<VoiceInput getUserMedia={getUserMedia} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(
      screen.getByRole("button", { name: "Cancel microphone request" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Start voice input" }));
    await screen.findByRole("button", { name: "Stop voice input" });
    await act(async () => first.resolve(late.stream));
    expect(late.track.stop).toHaveBeenCalledOnce();
    expect(second.track.stop).not.toHaveBeenCalled();
  });
  it("preserves native refs, prevents default activation, and supports strict mode cleanup", async () => {
    const { stream, track } = media();
    const onStop = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const controllerRef = createRef<VoiceInputController>();
    const getUserMedia = vi.fn(async () => stream);
    const { rerender, unmount } = render(
      <StrictMode>
        <VoiceInput
          ref={ref}
          controllerRef={controllerRef}
          getUserMedia={getUserMedia}
          onStop={onStop}
          onClick={(event) => event.preventDefault()}
        />
      </StrictMode>,
    );
    fireEvent.click(ref.current!);
    expect(getUserMedia).not.toHaveBeenCalled();
    rerender(
      <StrictMode>
        <VoiceInput
          ref={ref}
          controllerRef={controllerRef}
          getUserMedia={getUserMedia}
          onStop={onStop}
        />
      </StrictMode>,
    );
    fireEvent.click(ref.current!);
    await screen.findByRole("button", { name: "Stop voice input" });
    act(() => controllerRef.current?.stop());
    unmount();
    expect(track.stop).toHaveBeenCalledOnce();
    expect(onStop).toHaveBeenCalledOnce();
  });
  it.each([
    ["NotAllowedError", "permission-denied"],
    ["NotFoundError", "device-not-found"],
    ["NotReadableError", "device-busy"],
    ["OverconstrainedError", "constraints-error"],
    ["NotSupportedError", "unsupported"],
    ["UnknownError", "error"],
  ])("classifies %s and permits retry", async (name, state) => {
    const { stream } = media();
    const getUserMedia = vi
      .fn()
      .mockRejectedValueOnce(new DOMException("failure", name))
      .mockResolvedValueOnce(stream);
    render(<VoiceInput getUserMedia={getUserMedia} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveAttribute("data-state", state),
    );
    fireEvent.click(screen.getByRole("button"));
    await screen.findByRole("button", { name: "Stop voice input" });
  });
  it("closes partially constructed audio graphs without simulating activity", async () => {
    const close = vi.fn(async () => undefined);
    class BrokenContext {
      state = "running";
      close = close;
      createAnalyser() {
        throw new Error("audio graph failure");
      }
    }
    vi.stubGlobal("AudioContext", BrokenContext);
    const { stream } = media();
    render(<VoiceInput getUserMedia={async () => stream} />);
    fireEvent.click(screen.getByRole("button"));
    await screen.findByRole("button", { name: "Stop voice input" });
    expect(close).toHaveBeenCalledOnce();
  });
  it("disposes a suspended audio context when resume is rejected", async () => {
    const close = vi.fn(async () => undefined);
    const disconnect = vi.fn();
    class SuspendedContext {
      state = "suspended";
      close = close;
      resume = vi.fn(async () => {
        throw new Error("Resume denied");
      });
      createAnalyser() {
        return {
          frequencyBinCount: 64,
          disconnect,
          getByteFrequencyData: vi.fn(),
        };
      }
      createMediaStreamSource() {
        return { connect: vi.fn(), disconnect };
      }
    }
    vi.stubGlobal("AudioContext", SuspendedContext);
    const { stream } = media();
    const { unmount } = render(
      <VoiceInput getUserMedia={async () => stream} />,
    );
    fireEvent.click(screen.getByRole("button"));
    await screen.findByRole("button", { name: "Stop voice input" });
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    unmount();
    expect(close).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledTimes(2);
  });
});
