import { readFileSync } from "node:fs";
import { join } from "node:path";

interface RegistryFile {
  path: string;
  type: string;
}

interface RegistryItem {
  cssVars?: unknown;
  dependencies?: string[];
  devDependencies?: string[];
  files?: RegistryFile[];
  name: string;
  registryDependencies?: string[];
  type: string;
}

const registryRoot = join(process.cwd(), "../../registry/items");

function readRegistryItem(name: string) {
  return JSON.parse(
    readFileSync(join(registryRoot, `${name}.json`), "utf8"),
  ) as RegistryItem;
}

const expectations = {
  "avatar-group": {
    dependencies: ["motion"],
    devDependencies: [],
    files: [
      "packages/components/src/components/avatar-group/avatar-group.tsx",
      "packages/components/src/components/avatar-group/index.ts",
      "packages/components/src/utils/cn.ts",
    ],
    registryDependencies: ["dethink-base", "avatar"],
  },
  avatar: {
    dependencies: ["motion"],
    devDependencies: [],
    files: [
      "packages/components/src/components/avatar/avatar.tsx",
      "packages/components/src/components/avatar/index.ts",
      "packages/components/src/utils/cn.ts",
    ],
    registryDependencies: ["dethink-base"],
  },
  badge: {
    dependencies: [],
    devDependencies: [],
    files: [
      "packages/components/src/components/badge/badge.tsx",
      "packages/components/src/components/badge/index.ts",
      "packages/components/src/utils/cn.ts",
    ],
    registryDependencies: ["dethink-base"],
  },
  label: {
    dependencies: [],
    devDependencies: [],
    files: [
      "packages/components/src/components/label/label.tsx",
      "packages/components/src/components/label/index.ts",
      "packages/components/src/utils/cn.ts",
    ],
    registryDependencies: ["dethink-base"],
  },
} as const;

describe("identity-labeling registry metadata", () => {
  it.each(Object.entries(expectations))(
    "%s declares its expected dependency boundary and files",
    (name, expected) => {
      const item = readRegistryItem(name);

      expect(item.type).toBe("registry:ui");
      expect(item.dependencies ?? []).toEqual(expected.dependencies);
      expect(item.devDependencies ?? []).toEqual(expected.devDependencies);
      expect(item.registryDependencies ?? []).toEqual(
        expected.registryDependencies,
      );
      expect(item.files?.map((file) => file.path)).toEqual(expected.files);
      expect(
        item.files?.every((file) => file.type.startsWith("registry:")),
      ).toBe(true);
      expect(item.cssVars).toBeUndefined();
    },
  );

  it("keeps dependency-free primitives free of Motion and runtime UI dependencies", () => {
    expect(readRegistryItem("badge").dependencies ?? []).toEqual([]);
    expect(readRegistryItem("label").dependencies ?? []).toEqual([]);
  });

  it("keeps Motion explicit only for primitives that import motion/react", () => {
    expect(readRegistryItem("avatar").dependencies).toEqual(["motion"]);
    expect(readRegistryItem("avatar-group").dependencies).toEqual(["motion"]);
  });

  it("keeps identity CSS variable expectations centralized in the base registry item", () => {
    const base = readRegistryItem("base");
    const theme = (base.cssVars as { theme?: Record<string, string> }).theme;

    expect(base.name).toBe("dethink-base");
    expect(theme).toEqual(
      expect.objectContaining({
        "color-background": "var(--dt-color-background)",
        "color-border": "var(--dt-color-border)",
        "color-destructive": "var(--dt-color-destructive)",
        "color-foreground": "var(--dt-color-foreground)",
        "color-info": "var(--dt-color-info)",
        "color-input": "var(--dt-color-input)",
        "color-muted": "var(--dt-color-muted)",
        "color-muted-foreground": "var(--dt-color-muted-foreground)",
        "color-primary": "var(--dt-color-primary)",
        "color-ring": "var(--dt-color-ring)",
        "color-success": "var(--dt-color-success)",
        "color-warning": "var(--dt-color-warning)",
        "density-control": "var(--dt-density-control)",
        "density-gap": "var(--dt-density-gap)",
      }),
    );
  });
});
