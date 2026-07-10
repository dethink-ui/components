import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Steps } from ".";

function ServerSteps() {
  return (
    <Steps
      aria-label="Setup progress"
      value="profile"
      items={[
        { id: "account", label: "Account" },
        { id: "profile", label: "Profile" },
        { id: "review", label: "Review" },
      ]}
    />
  );
}

describe("Steps SSR", () => {
  it("renders readable ordered-list markup on the server", () => {
    const markup = renderToString(<ServerSteps />);

    expect(markup).toContain('data-slot="steps"');
    expect(markup).toContain('data-slot="steps-list"');
    expect(markup).toContain('role="list"');
    expect(markup).toContain('aria-current="step"');
    expect(markup).toContain("Profile");
    expect(markup).toContain("Current step");
    expect(markup).not.toContain("opacity:0");
    expect(markup).not.toContain("scale(0.96)");
  });

  it("renders the final visual state when motion is disabled", () => {
    const markup = renderToString(
      <Steps
        showProgress
        motionPreset="none"
        value="profile"
        items={[
          { id: "account", label: "Account" },
          { id: "profile", label: "Profile" },
          { id: "review", label: "Review" },
        ]}
      />,
    );

    expect(markup).toContain('data-reduced-motion="true"');
    expect(markup).toContain("scaleX(0.6666666666666665)");
    expect(markup).not.toContain("opacity:0");
  });

  it("hydrates without mismatch warnings", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(<ServerSteps />);

    await act(async () => {
      hydrateRoot(container, <ServerSteps />);
    });

    expect(
      consoleError.mock.calls.some(([message]) =>
        String(message).toLowerCase().includes("hydration"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
