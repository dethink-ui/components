import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export type DethinkColorMode = "light" | "dark" | "system";
export type DethinkTheme = DethinkColorMode;
export type DethinkDensity = "compact" | "default" | "comfortable";
export type DethinkSpacingToken =
  | "0"
  | "0.5"
  | "1"
  | "1.5"
  | "2"
  | "2.5"
  | "3"
  | "3.5"
  | "4"
  | "5"
  | "6"
  | "8"
  | "10"
  | "12";

export type DethinkColorTokens = {
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  primary: string;
  primaryForeground: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
  timelineBorder: string;
  timelineRail: string;
};

export type DethinkThemeConfig = {
  colorSchemes?: {
    light?: Partial<DethinkColorTokens>;
    dark?: Partial<DethinkColorTokens>;
  };
  fonts?: Partial<{
    body: string;
    heading: string;
    mono: string;
  }>;
  spacing?: Partial<Record<DethinkSpacingToken, string>>;
  radii?: Partial<{
    sm: string;
    md: string;
    lg: string;
  }>;
  density?: Partial<
    Record<
      DethinkDensity,
      Partial<{
        control: string;
        gap: string;
      }>
    >
  >;
};

type DethinkThemeStyle = CSSProperties & {
  [key: `--dt-${string}`]: string | number | undefined;
};

export interface DethinkProviderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  theme?: DethinkTheme;
  density?: DethinkDensity;
  dir?: "ltr" | "rtl";
  themeConfig?: DethinkThemeConfig;
}

export const defaultDethinkTheme: DethinkThemeConfig = {
  colorSchemes: {
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0 0)",
      muted: "oklch(0.97 0 0)",
      mutedForeground: "oklch(0.46 0 0)",
      border: "oklch(0.9 0 0)",
      input: "oklch(0.92 0 0)",
      ring: "oklch(0.55 0.18 255)",
      primary: "oklch(0.23 0 0)",
      primaryForeground: "oklch(0.985 0 0)",
      destructive: "oklch(0.58 0.22 28)",
      destructiveForeground: "oklch(0.985 0 0)",
      success: "oklch(0.58 0.16 145)",
      successForeground: "oklch(0.985 0 0)",
      warning: "oklch(0.72 0.16 75)",
      warningForeground: "oklch(0.18 0.02 75)",
      info: "oklch(0.6 0.17 255)",
      infoForeground: "oklch(0.985 0 0)",
      timelineBorder: "oklch(0.84 0 0)",
      timelineRail: "oklch(0.82 0 0)",
    },
    dark: {
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      muted: "oklch(0.22 0 0)",
      mutedForeground: "oklch(0.7 0 0)",
      border: "oklch(0.28 0 0)",
      input: "oklch(0.3 0 0)",
      ring: "oklch(0.72 0.15 255)",
      primary: "oklch(0.985 0 0)",
      primaryForeground: "oklch(0.23 0 0)",
      destructive: "oklch(0.67 0.2 28)",
      destructiveForeground: "oklch(0.985 0 0)",
      success: "oklch(0.66 0.16 145)",
      successForeground: "oklch(0.12 0.02 145)",
      warning: "oklch(0.78 0.16 75)",
      warningForeground: "oklch(0.14 0.02 75)",
      info: "oklch(0.72 0.15 255)",
      infoForeground: "oklch(0.12 0.02 255)",
      timelineBorder: "oklch(0.42 0 0)",
      timelineRail: "oklch(0.46 0 0)",
    },
  },
  fonts: {
    body: "ui-sans-serif, system-ui, sans-serif",
    heading: "ui-sans-serif, system-ui, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  spacing: {
    "0": "0rem",
    "0.5": "0.125rem",
    "1": "0.25rem",
    "1.5": "0.375rem",
    "2": "0.5rem",
    "2.5": "0.625rem",
    "3": "0.75rem",
    "3.5": "0.875rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
  },
  radii: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
  },
  density: {
    compact: {
      control: "2rem",
      gap: "0.375rem",
    },
    default: {
      control: "2.5rem",
      gap: "0.5rem",
    },
    comfortable: {
      control: "2.75rem",
      gap: "0.75rem",
    },
  },
};

export function defineDethinkTheme(
  config: DethinkThemeConfig,
): DethinkThemeConfig {
  return config;
}

function toKebabCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\./g, "-")
    .toLowerCase();
}

function setStyleVariable(
  style: DethinkThemeStyle,
  name: string,
  value: string | undefined,
) {
  if (value !== undefined) {
    style[`--dt-${name}`] = value;
  }
}

export function createDethinkThemeStyle(
  themeConfig?: DethinkThemeConfig,
): DethinkThemeStyle {
  const style: DethinkThemeStyle = {};

  for (const colorMode of ["light", "dark"] as const) {
    const colors = themeConfig?.colorSchemes?.[colorMode];

    if (colors) {
      for (const [token, value] of Object.entries(colors)) {
        setStyleVariable(
          style,
          `color-${toKebabCase(token)}-${colorMode}`,
          value,
        );
      }
    }
  }

  if (themeConfig?.fonts) {
    for (const [token, value] of Object.entries(themeConfig.fonts)) {
      setStyleVariable(style, `font-${toKebabCase(token)}`, value);
    }
  }

  if (themeConfig?.spacing) {
    for (const [token, value] of Object.entries(themeConfig.spacing)) {
      setStyleVariable(style, `space-${toKebabCase(token)}`, value);
    }
  }

  if (themeConfig?.radii) {
    for (const [token, value] of Object.entries(themeConfig.radii)) {
      setStyleVariable(style, `radius-${toKebabCase(token)}`, value);
    }
  }

  if (themeConfig?.density) {
    for (const [density, values] of Object.entries(themeConfig.density)) {
      for (const [token, value] of Object.entries(values ?? {})) {
        setStyleVariable(
          style,
          `density-${toKebabCase(token)}-${toKebabCase(density)}`,
          value,
        );
      }
    }
  }

  return style;
}

function getThemeScriptContent({
  defaultTheme = "system",
  storageKey = "dethink-theme",
}: Pick<DethinkThemeScriptProps, "defaultTheme" | "storageKey">) {
  const serializedDefaultTheme = JSON.stringify(defaultTheme);
  const serializedStorageKey = JSON.stringify(storageKey);

  return `(() => {
  try {
    const storageKey = ${serializedStorageKey};
    const fallbackTheme = ${serializedDefaultTheme};
    const storedTheme = window.localStorage.getItem(storageKey);
    const theme = storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : fallbackTheme;
    const colorScheme = theme === "system" ? "light dark" : theme;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = colorScheme;
    document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", colorScheme);
  } catch {
  }
})();`;
}

export interface DethinkThemeScriptProps {
  storageKey?: string;
  defaultTheme?: DethinkColorMode;
  nonce?: string;
}

export function DethinkThemeScript({
  defaultTheme = "system",
  nonce,
  storageKey = "dethink-theme",
}: DethinkThemeScriptProps): ReactElement {
  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: getThemeScriptContent({ defaultTheme, storageKey }),
      }}
    />
  );
}

export function DethinkProvider({
  children,
  className,
  theme = "system",
  density = "default",
  dir = "ltr",
  style,
  themeConfig,
  ...props
}: DethinkProviderProps) {
  const themeStyle = createDethinkThemeStyle(themeConfig);
  const mergedStyle = {
    ...themeStyle,
    ...style,
  };

  return (
    <div
      data-dethink-provider=""
      data-theme={theme}
      data-density={density}
      dir={dir}
      className={cn("bg-background text-foreground font-sans", className)}
      style={mergedStyle}
      {...props}
    >
      {children}
    </div>
  );
}
