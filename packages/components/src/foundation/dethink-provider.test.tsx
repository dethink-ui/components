import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type CSSProperties } from "react";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Box } from "../components/box";
import { Button } from "../components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { Field, FieldControl, FieldLabel } from "../components/form-field";
import { Input } from "../components/input";
import { Heading, Text } from "../components/typography";
import {
  DethinkProvider,
  DethinkThemeScript,
  createDethinkThemeStyle,
  defaultDethinkTheme,
  defineDethinkTheme,
  type DethinkThemeConfig,
} from "./dethink-provider";

type CustomPropertyStyle = CSSProperties & {
  [key: `--dt-${string}`]: string | number | undefined;
};

const stylesPath = join(process.cwd(), "src/styles.css");

describe("DethinkProvider", () => {
  it("keeps the default theme config available for consumers", () => {
    expect(defaultDethinkTheme.colorSchemes?.light?.background).toBe(
      "oklch(1 0 0)",
    );
    expect(defaultDethinkTheme.spacing?.["4"]).toBe("1rem");
    expect(defaultDethinkTheme.density?.default?.control).toBe("2.5rem");
  });

  it("flattens partial theme config into provider CSS variables", () => {
    const theme = defineDethinkTheme({
      colorSchemes: {
        light: {
          mutedForeground: "oklch(0.44 0.12 250)",
          primary: "oklch(0.55 0.2 260)",
        },
        dark: {
          timelineRail: "oklch(0.72 0.1 260)",
        },
      },
      density: {
        compact: {
          control: "1.875rem",
          gap: "0.25rem",
        },
      },
      fonts: {
        body: "Inter, sans-serif",
        heading: "Sora, sans-serif",
        mono: "JetBrains Mono, monospace",
      },
      radii: {
        md: "0.375rem",
      },
      spacing: {
        "2.5": "0.6875rem",
        "4": "1.125rem",
      },
    } satisfies DethinkThemeConfig);
    const style = createDethinkThemeStyle(theme);

    expect(style["--dt-color-muted-foreground-light"]).toBe(
      "oklch(0.44 0.12 250)",
    );
    expect(style["--dt-color-primary-light"]).toBe("oklch(0.55 0.2 260)");
    expect(style["--dt-color-timeline-rail-dark"]).toBe("oklch(0.72 0.1 260)");
    expect(style["--dt-font-body"]).toBe("Inter, sans-serif");
    expect(style["--dt-font-heading"]).toBe("Sora, sans-serif");
    expect(style["--dt-font-mono"]).toBe("JetBrains Mono, monospace");
    expect(style["--dt-space-2-5"]).toBe("0.6875rem");
    expect(style["--dt-space-4"]).toBe("1.125rem");
    expect(style["--dt-radius-md"]).toBe("0.375rem");
    expect(style["--dt-density-control-compact"]).toBe("1.875rem");
    expect(style["--dt-density-gap-compact"]).toBe("0.25rem");
    expect(style["--dt-color-background-dark"]).toBeUndefined();
  });

  it("sets provider attributes for theme, density, and text direction", () => {
    render(
      <DethinkProvider data-testid="provider">
        <span>Provider content</span>
      </DethinkProvider>,
    );

    const provider = screen.getByTestId("provider");

    expect(provider).toHaveAttribute("data-dethink-provider", "");
    expect(provider).toHaveAttribute("data-theme", "system");
    expect(provider).toHaveAttribute("data-density", "default");
    expect(provider).toHaveAttribute("dir", "ltr");
    expect(provider).toHaveClass(
      "bg-background",
      "font-sans",
      "text-foreground",
    );
  });

  it("keeps system mode light by default and dark-media scoped to system roots", () => {
    const styles = readFileSync(stylesPath, "utf8");
    const systemBlock = styles.match(
      /\[data-theme="system"\]\s*\{(?<block>[^}]+)\}/,
    )?.groups?.block;

    expect(systemBlock).toContain("color-scheme: light dark");
    expect(systemBlock).toContain(
      "--dt-color-background: var(--dt-color-background-light)",
    );
    expect(systemBlock).toContain(
      "--dt-color-timeline-rail: var(--dt-color-timeline-rail-light)",
    );
    expect(styles).toMatch(
      /@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\):not\(\[data-theme="dark"\]\),\s*\[data-theme="system"\]/,
    );
    expect(styles).not.toMatch(
      /@media \(prefers-color-scheme: dark\)\s*\{\s*:root,\s*\[data-theme="system"\]/,
    );
  });

  it("merges themeConfig variables before user style overrides", () => {
    const userStyle = {
      "--dt-font-body": "Override Sans",
      color: "red",
    } as CustomPropertyStyle;

    render(
      <DethinkProvider
        data-testid="provider"
        theme="dark"
        themeConfig={{
          fonts: {
            body: "Inter, sans-serif",
            heading: "Sora, sans-serif",
          },
          spacing: {
            "4": "1.25rem",
          },
        }}
        style={userStyle}
      >
        <span>Styled content</span>
      </DethinkProvider>,
    );

    const provider = screen.getByTestId("provider");

    expect(provider).toHaveAttribute("data-theme", "dark");
    expect(provider.style.getPropertyValue("--dt-font-body")).toBe(
      "Override Sans",
    );
    expect(provider.style.getPropertyValue("--dt-font-heading")).toBe(
      "Sora, sans-serif",
    );
    expect(provider.style.getPropertyValue("--dt-space-4")).toBe("1.25rem");
    expect(provider.style.color).toBe("red");
  });

  it("supports nested providers through ordinary CSS variable cascade", () => {
    render(
      <DethinkProvider
        data-testid="outer"
        density="compact"
        theme="dark"
        themeConfig={{ fonts: { body: "Outer Sans" } }}
      >
        <DethinkProvider
          data-testid="inner"
          density="comfortable"
          dir="rtl"
          theme="light"
          themeConfig={{ fonts: { body: "Inner Sans" } }}
        >
          Nested content
        </DethinkProvider>
      </DethinkProvider>,
    );

    const outer = screen.getByTestId("outer");
    const inner = screen.getByTestId("inner");

    expect(outer).toHaveAttribute("data-theme", "dark");
    expect(outer).toHaveAttribute("data-density", "compact");
    expect(outer.style.getPropertyValue("--dt-font-body")).toBe("Outer Sans");
    expect(inner).toHaveAttribute("data-theme", "light");
    expect(inner).toHaveAttribute("data-density", "comfortable");
    expect(inner).toHaveAttribute("dir", "rtl");
    expect(inner.style.getPropertyValue("--dt-font-body")).toBe("Inner Sans");
  });

  it("connects representative components to provider variables", () => {
    render(
      <DethinkProvider
        data-testid="provider"
        theme="light"
        themeConfig={{
          density: {
            default: {
              control: "3rem",
              gap: "0.875rem",
            },
          },
          fonts: {
            body: "Inter, sans-serif",
            heading: "Sora, sans-serif",
          },
          spacing: {
            "4": "1.25rem",
          },
        }}
      >
        <Button>Save</Button>
        <Box data-testid="box" p="4">
          Box
        </Box>
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>Card body</CardContent>
        </Card>
        <Field data-testid="field" required>
          <FieldLabel>Email</FieldLabel>
          <FieldControl>
            <Input aria-label="Email" />
          </FieldControl>
        </Field>
        <Heading level={2}>Analytics</Heading>
        <Text>Summary</Text>
      </DethinkProvider>,
    );

    const provider = screen.getByTestId("provider");

    expect(
      provider.style.getPropertyValue("--dt-density-control-default"),
    ).toBe("3rem");
    expect(provider.style.getPropertyValue("--dt-density-gap-default")).toBe(
      "0.875rem",
    );
    expect(provider.style.getPropertyValue("--dt-space-4")).toBe("1.25rem");
    expect(screen.getByRole("button", { name: "Save" })).toHaveClass(
      "h-density-control",
      "px-[var(--dt-space-4)]",
    );
    expect(screen.getByTestId("box")).toHaveClass("p-[var(--dt-space-4)]");
    expect(screen.getByText("Revenue")).toHaveClass("font-heading");
    expect(screen.getByTestId("field")).toHaveClass("gap-[var(--dt-space-2)]");
    expect(screen.getByLabelText("Email")).toHaveClass(
      "h-density-control",
      "px-[var(--dt-space-3)]",
    );
    expect(screen.getByRole("heading", { name: "Analytics" })).toHaveClass(
      "font-heading",
    );
    expect(screen.getByText("Summary")).toHaveClass("font-sans");
  });

  it("renders safely on the server with system mode and theme variables", () => {
    const markup = renderToString(
      <DethinkProvider
        theme="system"
        themeConfig={{
          colorSchemes: {
            light: {
              primary: "oklch(0.6 0.2 255)",
            },
          },
        }}
      >
        <span>Server content</span>
      </DethinkProvider>,
    );

    expect(markup).toContain('data-theme="system"');
    expect(markup).toContain("--dt-color-primary-light:oklch(0.6 0.2 255)");
    expect(markup).toContain("Server content");
  });
});

describe("DethinkThemeScript", () => {
  it("renders an optional no-flash script without browser-only provider logic", () => {
    const markup = renderToString(
      <DethinkThemeScript
        defaultTheme="dark"
        nonce="nonce-value"
        storageKey="app-theme"
      />,
    );

    expect(markup).toContain('nonce="nonce-value"');
    expect(markup).toContain("app-theme");
    expect(markup).toContain("localStorage");
    expect(markup).toContain("dataset.theme");
    expect(markup).toContain("colorScheme");
  });
});
