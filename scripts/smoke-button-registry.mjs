import { access, readFile } from "node:fs/promises";
import { dirname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const registryRoot = join(root, "registry/items");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function assertFileExists(path) {
  await access(path);
}

async function resolveExistingSourcePath(pathWithoutExtension) {
  const candidates = [
    `${pathWithoutExtension}.ts`,
    `${pathWithoutExtension}.tsx`,
    join(pathWithoutExtension, "index.ts"),
    join(pathWithoutExtension, "index.tsx"),
    pathWithoutExtension,
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  return undefined;
}

function collectRegistryFilePaths(item, registryItemsByName) {
  const registryFilePaths = new Set((item.files ?? []).map((file) => normalize(file.path)));

  for (const dependencyName of item.registryDependencies ?? []) {
    const dependency = registryItemsByName.get(dependencyName);

    if (!dependency) {
      continue;
    }

    for (const file of dependency.files ?? []) {
      registryFilePaths.add(normalize(file.path));
    }
  }

  return registryFilePaths;
}

async function assertRegistryRelativeImportsResolve(item, registryItemsByName) {
  const registryFilePaths = collectRegistryFilePaths(item, registryItemsByName);
  const importPattern =
    /\b(?:import|export)\b(?:[\s\S]*?)\bfrom\s*["'](\.{1,2}\/[^"']+)["']/g;

  for (const file of item.files ?? []) {
    if (!/\.[cm]?[tj]sx?$/.test(file.path)) {
      continue;
    }

    const absoluteFilePath = join(root, file.path);
    const source = await readFile(absoluteFilePath, "utf8");

    for (const match of source.matchAll(importPattern)) {
      const importPath = match[1];
      const resolvedPath = await resolveExistingSourcePath(
        normalize(join(dirname(absoluteFilePath), importPath)),
      );

      assert(
        resolvedPath,
        `${item.name} registry source ${file.path} imports missing path ${importPath}.`,
      );

      const relativeResolvedPath = normalize(relative(root, resolvedPath));

      assert(
        registryFilePaths.has(relativeResolvedPath),
        `${item.name} registry source ${file.path} imports ${relativeResolvedPath}, but that file is not declared in the registry item or its registryDependencies.`,
      );
    }
  }
}

const base = await readJson(join(registryRoot, "base.json"));
const box = await readJson(join(registryRoot, "box.json"));
const button = await readJson(join(registryRoot, "button.json"));
const card = await readJson(join(registryRoot, "card.json"));
const cardStack = await readJson(join(registryRoot, "card-stack.json"));
const checkbox = await readJson(join(registryRoot, "checkbox.json"));
const combobox = await readJson(join(registryRoot, "combobox.json"));
const container = await readJson(join(registryRoot, "container.json"));
const dialog = await readJson(join(registryRoot, "dialog.json"));
const formField = await readJson(join(registryRoot, "form-field.json"));
const input = await readJson(join(registryRoot, "input.json"));
const iconButton = await readJson(join(registryRoot, "icon-button.json"));
const flex = await readJson(join(registryRoot, "flex.json"));
const grid = await readJson(join(registryRoot, "grid.json"));
const link = await readJson(join(registryRoot, "link.json"));
const numberInput = await readJson(join(registryRoot, "number-input.json"));
const popover = await readJson(join(registryRoot, "popover.json"));
const radioGroup = await readJson(join(registryRoot, "radio-group.json"));
const separator = await readJson(join(registryRoot, "separator.json"));
const select = await readJson(join(registryRoot, "select.json"));
const stack = await readJson(join(registryRoot, "stack.json"));
const switchItem = await readJson(join(registryRoot, "switch.json"));
const textarea = await readJson(join(registryRoot, "textarea.json"));
const tooltip = await readJson(join(registryRoot, "tooltip.json"));
const dropdownMenu = await readJson(join(registryRoot, "dropdown-menu.json"));
const typography = await readJson(join(registryRoot, "typography.json"));
const dateTimePicker = await readJson(join(registryRoot, "date-time-picker.json"));
const timeline = await readJson(join(registryRoot, "timeline.json"));

const registryItemsByName = new Map(
  [
    base,
    box,
    button,
    card,
    cardStack,
    checkbox,
    combobox,
    container,
    dialog,
    formField,
    input,
    iconButton,
    flex,
    grid,
    link,
    numberInput,
    popover,
    radioGroup,
    separator,
    select,
    stack,
    switchItem,
    textarea,
    tooltip,
    dropdownMenu,
    typography,
    dateTimePicker,
    timeline,
  ].map((item) => [item.name, item]),
);

assert(box.name === "box", "box registry item must be named box.");
assert(button.name === "button", "button registry item must be named button.");
assert(card.name === "card", "card registry item must be named card.");
assert(
  cardStack.name === "card-stack",
  "card-stack registry item must be named card-stack.",
);
assert(checkbox.name === "checkbox", "checkbox registry item must be named checkbox.");
assert(combobox.name === "combobox", "combobox registry item must be named combobox.");
assert(container.name === "container", "container registry item must be named container.");
assert(dialog.name === "dialog", "dialog registry item must be named dialog.");
assert(formField.name === "form-field", "form-field registry item must be named form-field.");
assert(input.name === "input", "input registry item must be named input.");
assert(iconButton.name === "icon-button", "icon-button registry item must be named icon-button.");
assert(flex.name === "flex", "flex registry item must be named flex.");
assert(grid.name === "grid", "grid registry item must be named grid.");
assert(link.name === "link", "link registry item must be named link.");
assert(numberInput.name === "number-input", "number-input registry item must be named number-input.");
assert(popover.name === "popover", "popover registry item must be named popover.");
assert(radioGroup.name === "radio-group", "radio-group registry item must be named radio-group.");
assert(separator.name === "separator", "separator registry item must be named separator.");
assert(select.name === "select", "select registry item must be named select.");
assert(stack.name === "stack", "stack registry item must be named stack.");
assert(switchItem.name === "switch", "switch registry item must be named switch.");
assert(textarea.name === "textarea", "textarea registry item must be named textarea.");
assert(tooltip.name === "tooltip", "tooltip registry item must be named tooltip.");
assert(dropdownMenu.name === "dropdown-menu", "dropdown-menu registry item must be named dropdown-menu.");
assert(typography.name === "typography", "typography registry item must be named typography.");
assert(
  dateTimePicker.name === "date-time-picker",
  "date-time-picker registry item must be named date-time-picker.",
);
assert(timeline.name === "timeline", "timeline registry item must be named timeline.");
assert(
  box.registryDependencies?.includes("dethink-base"),
  "box registry item must depend on dethink-base.",
);
assert(
  button.registryDependencies?.includes("dethink-base"),
  "button registry item must depend on dethink-base.",
);
assert(
  card.registryDependencies?.includes("dethink-base"),
  "card registry item must depend on dethink-base.",
);
assert(
  cardStack.registryDependencies?.includes("dethink-base"),
  "card-stack registry item must depend on dethink-base.",
);
assert(
  cardStack.registryDependencies?.includes("card"),
  "card-stack registry item must depend on card.",
);
assert(
  cardStack.registryDependencies?.includes("icon-button"),
  "card-stack registry item must depend on icon-button.",
);
assert(
  checkbox.registryDependencies?.includes("dethink-base"),
  "checkbox registry item must depend on dethink-base.",
);
assert(
  combobox.registryDependencies?.includes("dethink-base"),
  "combobox registry item must depend on dethink-base.",
);
assert(
  container.registryDependencies?.includes("dethink-base"),
  "container registry item must depend on dethink-base.",
);
assert(
  dialog.registryDependencies?.includes("dethink-base"),
  "dialog registry item must depend on dethink-base.",
);
assert(
  dialog.registryDependencies?.includes("button"),
  "dialog registry item must depend on button for shared trigger and close styling.",
);
assert(
  formField.registryDependencies?.includes("dethink-base"),
  "form-field registry item must depend on dethink-base.",
);
assert(
  input.registryDependencies?.includes("dethink-base"),
  "input registry item must depend on dethink-base.",
);
assert(
  iconButton.registryDependencies?.includes("dethink-base"),
  "icon-button registry item must depend on dethink-base.",
);
assert(
  iconButton.registryDependencies?.includes("button"),
  "icon-button registry item must depend on button for shared variant types.",
);
assert(
  flex.registryDependencies?.includes("dethink-base"),
  "flex registry item must depend on dethink-base.",
);
assert(
  grid.registryDependencies?.includes("dethink-base"),
  "grid registry item must depend on dethink-base.",
);
assert(
  link.registryDependencies?.includes("dethink-base"),
  "link registry item must depend on dethink-base.",
);
assert(
  numberInput.registryDependencies?.includes("dethink-base"),
  "number-input registry item must depend on dethink-base.",
);
assert(
  popover.registryDependencies?.includes("dethink-base"),
  "popover registry item must depend on dethink-base.",
);
assert(
  popover.registryDependencies?.includes("button"),
  "popover registry item must depend on button for shared trigger and close styling.",
);
assert(
  radioGroup.registryDependencies?.includes("dethink-base"),
  "radio-group registry item must depend on dethink-base.",
);
assert(
  separator.registryDependencies?.includes("dethink-base"),
  "separator registry item must depend on dethink-base.",
);
assert(
  select.registryDependencies?.includes("dethink-base"),
  "select registry item must depend on dethink-base.",
);
assert(
  stack.registryDependencies?.includes("dethink-base"),
  "stack registry item must depend on dethink-base.",
);
assert(
  switchItem.registryDependencies?.includes("dethink-base"),
  "switch registry item must depend on dethink-base.",
);
assert(
  textarea.registryDependencies?.includes("dethink-base"),
  "textarea registry item must depend on dethink-base.",
);
assert(
  tooltip.registryDependencies?.includes("dethink-base"),
  "tooltip registry item must depend on dethink-base.",
);
assert(
  tooltip.registryDependencies?.includes("button"),
  "tooltip registry item must depend on button for shared trigger styling.",
);
assert(
  dropdownMenu.registryDependencies?.includes("dethink-base"),
  "dropdown-menu registry item must depend on dethink-base.",
);
assert(
  dropdownMenu.registryDependencies?.includes("button"),
  "dropdown-menu registry item must depend on button for shared trigger styling.",
);
assert(
  typography.registryDependencies?.includes("dethink-base"),
  "typography registry item must depend on dethink-base.",
);
assert(
  dateTimePicker.registryDependencies?.includes("dethink-base"),
  "date-time-picker registry item must depend on dethink-base.",
);
assert(
  timeline.registryDependencies?.includes("dethink-base"),
  "timeline registry item must depend on dethink-base.",
);
assert(
  Array.isArray(box.dependencies) && box.dependencies.length === 0,
  "box registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(button.dependencies) && button.dependencies.length === 0,
  "button registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(card.dependencies) && card.dependencies.length === 0,
  "card registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(cardStack.dependencies) && cardStack.dependencies.length === 0,
  "card-stack registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(checkbox.dependencies) && checkbox.dependencies.length === 0,
  "checkbox registry item must not add runtime dependencies.",
);
assert(
  combobox.dependencies?.includes("react-aria-components"),
  "combobox registry item must include react-aria-components.",
);
assert(
  Array.isArray(container.dependencies) && container.dependencies.length === 0,
  "container registry item must not add runtime dependencies.",
);
assert(
  dialog.dependencies?.includes("react-aria"),
  "dialog registry item must include react-aria.",
);
assert(
  dialog.dependencies?.includes("react-aria-components"),
  "dialog registry item must include react-aria-components.",
);
assert(
  Array.isArray(formField.dependencies) && formField.dependencies.length === 0,
  "form-field registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(input.dependencies) && input.dependencies.length === 0,
  "input registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(iconButton.dependencies) && iconButton.dependencies.length === 0,
  "icon-button registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(flex.dependencies) && flex.dependencies.length === 0,
  "flex registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(grid.dependencies) && grid.dependencies.length === 0,
  "grid registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(link.dependencies) && link.dependencies.length === 0,
  "link registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(numberInput.dependencies) && numberInput.dependencies.length === 0,
  "number-input registry item must not add runtime dependencies.",
);
assert(
  popover.dependencies?.includes("react-aria"),
  "popover registry item must include react-aria.",
);
assert(
  popover.dependencies?.includes("react-aria-components"),
  "popover registry item must include react-aria-components.",
);
assert(
  Array.isArray(radioGroup.dependencies) && radioGroup.dependencies.length === 0,
  "radio-group registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(separator.dependencies) && separator.dependencies.length === 0,
  "separator registry item must not add runtime dependencies.",
);
assert(
  select.dependencies?.includes("react-aria-components"),
  "select registry item must include react-aria-components.",
);
assert(
  Array.isArray(stack.dependencies) && stack.dependencies.length === 0,
  "stack registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(switchItem.dependencies) && switchItem.dependencies.length === 0,
  "switch registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(textarea.dependencies) && textarea.dependencies.length === 0,
  "textarea registry item must not add runtime dependencies.",
);
assert(
  tooltip.dependencies?.includes("react-aria"),
  "tooltip registry item must include react-aria.",
);
assert(
  tooltip.dependencies?.includes("react-aria-components"),
  "tooltip registry item must include react-aria-components.",
);
assert(
  dropdownMenu.dependencies?.includes("react-aria"),
  "dropdown-menu registry item must include react-aria.",
);
assert(
  dropdownMenu.dependencies?.includes("react-aria-components"),
  "dropdown-menu registry item must include react-aria-components.",
);
assert(
  Array.isArray(typography.dependencies) && typography.dependencies.length === 0,
  "typography registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(timeline.dependencies) && timeline.dependencies.length === 0,
  "timeline registry item must not add runtime dependencies.",
);
assert(
  dateTimePicker.dependencies?.includes("@internationalized/date"),
  "date-time-picker registry item must include @internationalized/date.",
);
assert(
  dateTimePicker.dependencies?.includes("react-aria-components"),
  "date-time-picker registry item must include react-aria-components.",
);

for (const item of [
  base,
  box,
  button,
  card,
  cardStack,
  checkbox,
  combobox,
  container,
  dialog,
  formField,
  input,
  iconButton,
  flex,
  grid,
  link,
  numberInput,
  popover,
  radioGroup,
  separator,
  select,
  stack,
  switchItem,
  textarea,
  tooltip,
  dropdownMenu,
  typography,
  dateTimePicker,
  timeline,
]) {
  for (const file of item.files ?? []) {
    await assertFileExists(join(root, file.path));
  }
}

await assertRegistryRelativeImportsResolve(container, registryItemsByName);
await assertRegistryRelativeImportsResolve(card, registryItemsByName);
await assertRegistryRelativeImportsResolve(cardStack, registryItemsByName);
await assertRegistryRelativeImportsResolve(checkbox, registryItemsByName);
await assertRegistryRelativeImportsResolve(combobox, registryItemsByName);
await assertRegistryRelativeImportsResolve(dialog, registryItemsByName);
await assertRegistryRelativeImportsResolve(formField, registryItemsByName);
await assertRegistryRelativeImportsResolve(input, registryItemsByName);
await assertRegistryRelativeImportsResolve(grid, registryItemsByName);
await assertRegistryRelativeImportsResolve(numberInput, registryItemsByName);
await assertRegistryRelativeImportsResolve(popover, registryItemsByName);
await assertRegistryRelativeImportsResolve(radioGroup, registryItemsByName);
await assertRegistryRelativeImportsResolve(separator, registryItemsByName);
await assertRegistryRelativeImportsResolve(select, registryItemsByName);
await assertRegistryRelativeImportsResolve(switchItem, registryItemsByName);
await assertRegistryRelativeImportsResolve(textarea, registryItemsByName);
await assertRegistryRelativeImportsResolve(tooltip, registryItemsByName);
await assertRegistryRelativeImportsResolve(dropdownMenu, registryItemsByName);

const stylePath = base.files.find((file) => file.type === "registry:style")?.path;
assert(stylePath, "base registry item must include a registry:style file.");

const styles = await readFile(join(root, stylePath), "utf8");
const boxSource = await readFile(
  join(root, "packages/components/src/components/box/box.tsx"),
  "utf8",
);
const buttonSource = await readFile(
  join(root, "packages/components/src/components/button/button.tsx"),
  "utf8",
);
const cardSource = await readFile(
  join(root, "packages/components/src/components/card/card.tsx"),
  "utf8",
);
const cardStackSource = await readFile(
  join(root, "packages/components/src/components/card-stack/card-stack.tsx"),
  "utf8",
);
const checkboxSource = await readFile(
  join(root, "packages/components/src/components/checkbox/checkbox.tsx"),
  "utf8",
);
const comboboxSource = await readFile(
  join(root, "packages/components/src/components/combobox/combobox.tsx"),
  "utf8",
);
const containerSource = await readFile(
  join(root, "packages/components/src/components/container/container.tsx"),
  "utf8",
);
const formFieldSource = await readFile(
  join(root, "packages/components/src/components/form-field/form-field.tsx"),
  "utf8",
);
const iconButtonSource = await readFile(
  join(root, "packages/components/src/components/icon-button/icon-button.tsx"),
  "utf8",
);
const flexSource = await readFile(
  join(root, "packages/components/src/components/flex/flex.tsx"),
  "utf8",
);
const gridSource = await readFile(
  join(root, "packages/components/src/components/grid/grid.tsx"),
  "utf8",
);
const linkSource = await readFile(
  join(root, "packages/components/src/components/link/link.tsx"),
  "utf8",
);
const popoverSource = await readFile(
  join(root, "packages/components/src/components/popover/popover.tsx"),
  "utf8",
);
const radioGroupSource = await readFile(
  join(root, "packages/components/src/components/radio-group/radio-group.tsx"),
  "utf8",
);
const separatorSource = await readFile(
  join(root, "packages/components/src/components/separator/separator.tsx"),
  "utf8",
);
const selectSource = await readFile(
  join(root, "packages/components/src/components/select/select.tsx"),
  "utf8",
);
const stackSource = await readFile(
  join(root, "packages/components/src/components/stack/stack.tsx"),
  "utf8",
);
const switchSource = await readFile(
  join(root, "packages/components/src/components/switch/switch.tsx"),
  "utf8",
);
const tooltipSource = await readFile(
  join(root, "packages/components/src/components/tooltip/tooltip.tsx"),
  "utf8",
);
const dropdownMenuSource = await readFile(
  join(root, "packages/components/src/components/dropdown-menu/dropdown-menu.tsx"),
  "utf8",
);
const typographySource = await readFile(
  join(root, "packages/components/src/components/typography/typography.tsx"),
  "utf8",
);
const dateTimePickerSource = await readFile(
  join(root, "packages/components/src/components/date-time-picker/date-time-picker.tsx"),
  "utf8",
);
const dialogSource = await readFile(
  join(root, "packages/components/src/components/dialog/dialog.tsx"),
  "utf8",
);
const providerPortalSource = await readFile(
  join(root, "packages/components/src/utils/provider-portal.tsx"),
  "utf8",
);
const positionedOverlaySource = await readFile(
  join(root, "packages/components/src/utils/positioned-overlay.tsx"),
  "utf8",
);
const timelineSource = await readFile(
  join(root, "packages/components/src/components/timeline/timeline.tsx"),
  "utf8",
);

assert(styles.includes('@import "tailwindcss";'), "base styles must import Tailwind.");
assert(styles.includes("@source"), "base styles must register component sources.");
assert(styles.includes("@theme"), "base styles must define Tailwind theme tokens.");
assert(styles.includes("--color-primary"), "base styles must expose primary token.");
assert(styles.includes("--spacing-density-control"), "base styles must expose density token.");
assert(
  styles.includes("--color-timeline-border"),
  "base styles must expose timeline border token.",
);
assert(
  styles.includes("--color-timeline-rail"),
  "base styles must expose timeline rail token.",
);
assert(boxSource.includes('"data-slot": "box"'), "box source must expose stable slot data.");
assert(boxSource.includes("asChild"), "box source must expose child composition.");
assert(boxSource.includes("boxClassNames"), "box source must expose class-name composition.");
assert(
  boxSource.includes("ps-[var(--dt-space-4)]"),
  "box source must use tokenized logical start spacing utilities.",
);
assert(
  boxSource.includes("me-[var(--dt-space-4)]"),
  "box source must use tokenized logical end margin utilities.",
);
assert(boxSource.includes("bg-primary"), "box source must use tokenized primary surface utilities.");
assert(boxSource.includes("border-input"), "box source must use tokenized input border utilities.");
assert(boxSource.includes("rounded-md"), "box source must use tokenized radius utilities.");
assert(boxSource.includes("overflow-clip"), "box source must expose overflow clip utilities.");
assert(!boxSource.includes("@radix-ui"), "box source must remain dependency-free.");
assert(buttonSource.includes("leftIcon"), "button source must expose leftIcon.");
assert(buttonSource.includes("rightIcon"), "button source must expose rightIcon.");
assert(buttonSource.includes("asChild"), "button source must expose asChild.");
assert(buttonSource.includes("data-slot=\"button\""), "button source must expose stable slot data.");
assert(buttonSource.includes("bg-primary"), "button source must use tokenized primary utilities.");
assert(!buttonSource.includes("@radix-ui"), "button source must remain dependency-free.");
assert(cardSource.includes('"data-slot": "card"'), "card source must expose stable root slot data.");
assert(
  cardSource.includes('"data-slot": "card-header"'),
  "card source must expose stable header slot data.",
);
assert(
  cardSource.includes('"data-slot": "card-title"'),
  "card source must expose stable title slot data.",
);
assert(
  cardSource.includes('"data-slot": "card-description"'),
  "card source must expose stable description slot data.",
);
assert(
  cardSource.includes('"data-slot": "card-action"'),
  "card source must expose stable action slot data.",
);
assert(
  cardSource.includes('"data-slot": "card-content"'),
  "card source must expose stable content slot data.",
);
assert(
  cardSource.includes('"data-slot": "card-footer"'),
  "card source must expose stable footer slot data.",
);
assert(cardSource.includes("asChild"), "card source must expose child composition.");
assert(cardSource.includes("cardClassNames"), "card source must expose class-name composition.");
assert(cardSource.includes("CardFooterJustify"), "card source must expose footer justification typing.");
assert(cardSource.includes("bg-background"), "card source must use tokenized background utilities.");
assert(cardSource.includes("bg-muted"), "card source must use tokenized muted utilities.");
assert(cardSource.includes("border-border"), "card source must use tokenized border utilities.");
assert(cardSource.includes("rounded-lg"), "card source must use tokenized radius utilities.");
assert(cardSource.includes("shadow-sm"), "card source must expose shadow utilities.");
assert(cardSource.includes("--card-padding"), "card source must expose density-backed card padding.");
assert(cardSource.includes("--card-gap"), "card source must expose density-backed card gap.");
assert(
  cardSource.includes("ms-[var(--dt-space-4)]"),
  "card source must use tokenized logical action spacing.",
);
assert(cardSource.includes("justify-between"), "card source must expose footer distribution utilities.");
assert(!cardSource.includes("@radix-ui"), "card source must remain dependency-free.");
assert(
  cardStackSource.includes('data-slot="card-stack"'),
  "card-stack source must expose stable root slot data.",
);
assert(
  cardStackSource.includes('data-slot="card-stack-item"'),
  "card-stack source must expose item slot data.",
);
assert(
  cardStackSource.includes('data-slot="card-stack-controls"'),
  "card-stack source must expose controls slot data.",
);
assert(
  cardStackSource.includes("CardStackMode"),
  "card-stack source must expose mode typing.",
);
assert(
  cardStackSource.includes("activeIndex"),
  "card-stack source must expose controlled active index support.",
);
assert(
  cardStackSource.includes("defaultActiveIndex"),
  "card-stack source must expose uncontrolled active index support.",
);
assert(
  cardStackSource.includes("onActiveIndexChange"),
  "card-stack source must expose active index change callbacks.",
);
assert(cardStackSource.includes("inert"), "card-stack source must make inactive cards inert.");
assert(
  cardStackSource.includes("aria-hidden"),
  "card-stack source must hide inactive cards from assistive tech.",
);
assert(
  cardStackSource.includes("IconButton"),
  "card-stack source must use IconButton for navigation controls.",
);
assert(
  cardStackSource.includes("[translate:var(--card-stack-translate)]"),
  "card-stack source must use transform custom properties.",
);
assert(
  cardStackSource.includes("motion-safe:transition"),
  "card-stack source must use reduced-motion-aware transitions.",
);
assert(!cardStackSource.includes("framer-motion"), "card-stack source must not use Motion.");
assert(!cardStackSource.includes("@radix-ui"), "card-stack source must remain Radix-free.");
assert(
  checkboxSource.includes('data-slot={dataSlot ?? "checkbox"}'),
  "checkbox source must expose stable root slot data.",
);
assert(
  checkboxSource.includes('data-slot="checkbox-input"'),
  "checkbox source must expose stable input slot data.",
);
assert(
  checkboxSource.includes('data-slot="checkbox-indicator"'),
  "checkbox source must expose stable indicator slot data.",
);
assert(
  checkboxSource.includes("CheckboxCheckedState"),
  "checkbox source must expose checked state typing.",
);
assert(
  checkboxSource.includes("indeterminate"),
  "checkbox source must support indeterminate state.",
);
assert(
  checkboxSource.includes('aria-checked={checkedState === "indeterminate" ? "mixed" : undefined}'),
  "checkbox source must expose mixed state to assistive tech.",
);
assert(
  checkboxSource.includes("onCheckedChange"),
  "checkbox source must expose checked change callbacks.",
);
assert(
  checkboxSource.includes("type=\"checkbox\""),
  "checkbox source must preserve native checkbox input semantics.",
);
assert(
  checkboxSource.includes("border-input"),
  "checkbox source must use tokenized input border utilities.",
);
assert(
  checkboxSource.includes("--choice-control-size"),
  "checkbox source must use density-backed control sizing.",
);
assert(
  checkboxSource.includes("group-disabled/field-set:opacity-60"),
  "checkbox source must style inherited fieldset disabled state.",
);
assert(
  checkboxSource.includes("focus-visible:ring-2"),
  "checkbox source must include visible focus styling.",
);
assert(!checkboxSource.includes("@radix-ui"), "checkbox source must remain Radix-free.");
assert(
  comboboxSource.includes("react-aria-components"),
  "combobox source must use React Aria Components.",
);
assert(
  comboboxSource.includes('data-slot={dataSlot ?? "combobox"}'),
  "combobox source must expose stable root slot data.",
);
assert(
  comboboxSource.includes('data-slot="combobox-control"'),
  "combobox source must expose stable control slot data.",
);
assert(
  comboboxSource.includes('data-slot="combobox-input"'),
  "combobox source must expose stable input slot data.",
);
assert(
  comboboxSource.includes('data-slot="combobox-button"'),
  "combobox source must expose stable button slot data.",
);
assert(
  comboboxSource.includes('data-slot="combobox-popover"'),
  "combobox source must expose stable popover slot data.",
);
assert(
  comboboxSource.includes('container.setAttribute("data-slot", "combobox-portal-container")'),
  "combobox source must expose stable portal host slot data.",
);
assert(
  comboboxSource.includes('data-slot="combobox-listbox"'),
  "combobox source must expose stable listbox slot data.",
);
assert(
  comboboxSource.includes('data-slot="combobox-item"'),
  "combobox source must expose stable item slot data.",
);
assert(
  comboboxSource.includes("return document.createElement(\"div\")") &&
    comboboxSource.includes("UNSTABLE_portalContainer={portalContainer ?? undefined}"),
  "combobox source must create an explicit provider-aware portal container before client popover rendering.",
);
assert(
  comboboxSource.includes("selectedKey={toSelectionKey(value)}"),
  "combobox source must map public values to React Aria selected keys.",
);
assert(
  comboboxSource.includes("onInputChange={onInputValueChange}"),
  "combobox source must expose input value change callbacks.",
);
assert(
  comboboxSource.includes("formValue={formValue}"),
  "combobox source must expose formValue submission mode.",
);
assert(
  comboboxSource.includes("isReadOnly={readOnly}"),
  "combobox source must expose read-only state.",
);
assert(
  comboboxSource.includes("type ComboboxComponent = (<T extends ComboboxItemData"),
  "combobox source must preserve generic item typing.",
);
assert(
  comboboxSource.includes("bg-background"),
  "combobox source must use tokenized background utilities.",
);
assert(
  comboboxSource.includes("border-input"),
  "combobox source must use tokenized input border utilities.",
);
assert(
  comboboxSource.includes("ring-ring"),
  "combobox source must use tokenized focus ring utilities.",
);
assert(
  comboboxSource.includes("text-destructive"),
  "combobox source must use tokenized destructive utilities.",
);
assert(
  comboboxSource.includes("h-density-control"),
  "combobox source must use provider density control utilities.",
);
assert(!comboboxSource.includes("@radix-ui"), "combobox source must remain Radix-free.");
assert(
  containerSource.includes('"data-slot": "container"'),
  "container source must expose stable slot data.",
);
assert(containerSource.includes("asChild"), "container source must expose child composition.");
assert(
  containerSource.includes("containerClassNames"),
  "container source must expose class-name composition.",
);
assert(
  containerSource.includes("max-w-[80rem]"),
  "container source must use static max-width utilities.",
);
assert(
  containerSource.includes("px-[var(--container-gutter)]"),
  "container source must use tokenized gutter utilities.",
);
assert(
  containerSource.includes("safe-area-inset-left"),
  "container source must support safe-area gutters.",
);
assert(containerSource.includes("mx-auto"), "container source must default to centered layout.");
assert(containerSource.includes("me-auto"), "container source must support logical start alignment.");
assert(containerSource.includes("ms-auto"), "container source must support logical end alignment.");
assert(!containerSource.includes("@radix-ui"), "container source must remain dependency-free.");
assert(
  formFieldSource.includes('data-slot="form"'),
  "form-field source must expose stable form slot data.",
);
assert(
  formFieldSource.includes('data-slot": "field"') ||
    formFieldSource.includes('data-slot="field"'),
  "form-field source must expose stable field slot data.",
);
assert(
  formFieldSource.includes('"data-slot": "field-control"') ||
    formFieldSource.includes('data-slot="field-control"'),
  "form-field source must expose stable control slot data.",
);
assert(
  formFieldSource.includes('"data-slot": "field-description"') ||
    formFieldSource.includes('data-slot="field-description"'),
  "form-field source must expose stable description slot data.",
);
assert(
  formFieldSource.includes('"data-slot": "field-error"') ||
    formFieldSource.includes('data-slot="field-error"'),
  "form-field source must expose stable error slot data.",
);
assert(
  formFieldSource.includes('data-slot="field-set"'),
  "form-field source must expose stable fieldset slot data.",
);
assert(
  formFieldSource.includes("group/field-set"),
  "form-field source must expose fieldset group styling hooks.",
);
assert(
  formFieldSource.includes("aria-describedby"),
  "form-field source must wire descriptions to controls.",
);
assert(
  formFieldSource.includes("aria-invalid"),
  "form-field source must expose invalid state to controls.",
);
assert(
  formFieldSource.includes("aria-errormessage"),
  "form-field source must expose error messages to controls.",
);
assert(
  formFieldSource.includes("useId"),
  "form-field source must generate hydration-safe accessibility ids.",
);
assert(!formFieldSource.includes("@radix-ui"), "form-field source must remain Radix-free.");
assert(
  iconButtonSource.includes("IconButtonAccessibleName"),
  "icon-button source must expose accessible-name typing.",
);
assert(
  iconButtonSource.includes("data-slot=\"icon-button\""),
  "icon-button source must expose stable root slot data.",
);
assert(
  iconButtonSource.includes("data-slot=\"icon-button-icon\""),
  "icon-button source must expose stable icon slot data.",
);
assert(
  iconButtonSource.includes("aria-busy"),
  "icon-button source must expose loading busy state.",
);
assert(iconButtonSource.includes("bg-primary"), "icon-button source must use tokenized primary utilities.");
assert(!iconButtonSource.includes("@radix-ui"), "icon-button source must remain dependency-free.");
assert(flexSource.includes('"data-slot": "flex"'), "flex source must expose stable root slot data.");
assert(
  flexSource.includes('"data-slot": "flex-item"'),
  "flex source must expose stable item slot data.",
);
assert(flexSource.includes("asChild"), "flex source must expose child composition.");
assert(flexSource.includes("flexClassNames"), "flex source must expose class-name composition.");
assert(flexSource.includes("flexItemClassNames"), "flex source must expose item class-name composition.");
assert(flexSource.includes("inline-flex"), "flex source must expose inline-flex utilities.");
assert(flexSource.includes("flex-row"), "flex source must expose row direction utilities.");
assert(flexSource.includes("flex-col"), "flex source must expose column direction utilities.");
assert(flexSource.includes("flex-wrap"), "flex source must expose wrapping utilities.");
assert(
  flexSource.includes("gap-y-[var(--dt-space-2)]"),
  "flex source must expose tokenized row gap utilities.",
);
assert(
  flexSource.includes("gap-x-[var(--dt-space-6)]"),
  "flex source must expose tokenized column gap utilities.",
);
assert(flexSource.includes("items-center"), "flex source must expose alignment utilities.");
assert(flexSource.includes("justify-evenly"), "flex source must expose distribution utilities.");
assert(flexSource.includes("content-between"), "flex source must expose align-content utilities.");
assert(flexSource.includes("grow-0"), "flex source must expose grow utilities.");
assert(flexSource.includes("shrink-0"), "flex source must expose shrink utilities.");
assert(flexSource.includes("basis-64"), "flex source must expose basis utilities.");
assert(flexSource.includes("min-w-0"), "flex source must expose long-content shrink utilities.");
assert(!flexSource.includes("reverse"), "flex source must not expose visual reverse ordering.");
assert(!flexSource.includes("@radix-ui"), "flex source must remain dependency-free.");
assert(gridSource.includes('"data-slot": "grid"'), "grid source must expose stable root slot data.");
assert(
  gridSource.includes('"data-slot": "grid-item"'),
  "grid source must expose stable item slot data.",
);
assert(gridSource.includes("asChild"), "grid source must expose child composition.");
assert(gridSource.includes("gridClassNames"), "grid source must expose class-name composition.");
assert(
  gridSource.includes("gridItemClassNames"),
  "grid source must expose item class-name composition.",
);
assert(gridSource.includes("grid-cols-12"), "grid source must expose fixed grid columns.");
assert(
  gridSource.includes("repeat(auto-fit,minmax(min(16rem,100%),1fr))"),
  "grid source must expose static auto-fit grid columns.",
);
assert(gridSource.includes("grid-rows-3"), "grid source must expose row utilities.");
assert(
  gridSource.includes("gap-y-[var(--dt-space-2)]"),
  "grid source must expose tokenized row gap utilities.",
);
assert(
  gridSource.includes("gap-x-[var(--dt-space-6)]"),
  "grid source must expose tokenized column gap utilities.",
);
assert(gridSource.includes("items-center"), "grid source must expose item alignment utilities.");
assert(
  gridSource.includes("justify-items-end"),
  "grid source must expose item justification utilities.",
);
assert(
  gridSource.includes("content-between"),
  "grid source must expose align-content utilities.",
);
assert(
  gridSource.includes("justify-evenly"),
  "grid source must expose justify-content utilities.",
);
assert(gridSource.includes("col-span-full"), "grid source must expose column span utilities.");
assert(gridSource.includes("row-span-full"), "grid source must expose row span utilities.");
assert(gridSource.includes("justify-self-end"), "grid source must expose item self justification utilities.");
assert(gridSource.includes("min-w-0"), "grid source must expose long-content shrink utilities.");
assert(!gridSource.includes("dense"), "grid source must not expose dense visual packing.");
assert(!gridSource.includes("@radix-ui"), "grid source must remain dependency-free.");
assert(linkSource.includes("data-slot=\"link\""), "link source must expose stable slot data.");
assert(linkSource.includes("aria-current"), "link source must preserve aria-current state.");
assert(linkSource.includes("noopener"), "link source must add new-tab noopener safety.");
assert(linkSource.includes("asChild"), "link source must expose router composition.");
assert(linkSource.includes("text-primary"), "link source must use tokenized primary utilities.");
assert(!linkSource.includes("@radix-ui"), "link source must remain dependency-free.");
assert(
  radioGroupSource.includes('data-slot="radio-group"'),
  "radio-group source must expose stable group slot data.",
);
assert(
  radioGroupSource.includes('data-slot={dataSlot ?? "radio-group-item"}'),
  "radio-group source must expose stable item slot data.",
);
assert(
  radioGroupSource.includes('data-slot="radio-group-item-input"'),
  "radio-group source must expose stable input slot data.",
);
assert(
  radioGroupSource.includes('data-slot="radio-group-item-indicator"'),
  "radio-group source must expose stable indicator slot data.",
);
assert(
  radioGroupSource.includes("onValueChange"),
  "radio-group source must expose value change callbacks.",
);
assert(
  radioGroupSource.includes("RadioGroupContext"),
  "radio-group source must share group state through context.",
);
assert(
  radioGroupSource.includes('role={resolvedRole}'),
  "radio-group source must expose radiogroup semantics for labelled standalone groups.",
);
assert(
  radioGroupSource.includes("type=\"radio\""),
  "radio-group source must preserve native radio input semantics.",
);
assert(
  radioGroupSource.includes("border-input"),
  "radio-group source must use tokenized input border utilities.",
);
assert(
  radioGroupSource.includes("--choice-control-size"),
  "radio-group source must use density-backed item sizing.",
);
assert(
  radioGroupSource.includes("group-disabled/field-set:opacity-60"),
  "radio-group source must style inherited fieldset disabled state.",
);
assert(
  radioGroupSource.includes("focus-visible:ring-2"),
  "radio-group source must include visible focus styling.",
);
assert(!radioGroupSource.includes("@radix-ui"), "radio-group source must remain Radix-free.");
assert(
  separatorSource.includes('"data-slot": "separator"'),
  "separator source must expose stable slot data.",
);
assert(separatorSource.includes("Divider"), "separator source must expose Divider alias.");
assert(separatorSource.includes("asChild"), "separator source must expose child composition.");
assert(
  separatorSource.includes("separatorClassNames"),
  "separator source must expose class-name composition.",
);
assert(separatorSource.includes("aria-hidden"), "separator source must expose decorative mode.");
assert(
  separatorSource.includes("aria-orientation"),
  "separator source must expose orientation semantics.",
);
assert(separatorSource.includes('role: asChild || as !== "hr" ? "separator" : undefined'), "separator source must preserve native hr semantics.");
assert(separatorSource.includes("h-px"), "separator source must expose horizontal thickness utilities.");
assert(separatorSource.includes("w-px"), "separator source must expose vertical thickness utilities.");
assert(separatorSource.includes("bg-border"), "separator source must use tokenized border color utilities.");
assert(separatorSource.includes("bg-muted-foreground/25"), "separator source must expose muted tone utilities.");
assert(separatorSource.includes("bg-foreground/40"), "separator source must expose strong tone utilities.");
assert(
  separatorSource.includes("my-[var(--dt-space-4)]"),
  "separator source must expose tokenized horizontal spacing utilities.",
);
assert(
  separatorSource.includes("mx-[var(--dt-space-4)]"),
  "separator source must expose tokenized vertical spacing utilities.",
);
assert(
  separatorSource.includes('"aria-valuenow"?: never'),
  "separator source must type-reject splitter value semantics.",
);
assert(
  separatorSource.includes('"aria-valuenow": undefined'),
  "separator source must strip splitter value semantics at runtime.",
);
assert(!separatorSource.includes("@radix-ui"), "separator source must remain dependency-free.");
assert(
  selectSource.includes("react-aria-components"),
  "select source must use React Aria Components.",
);
assert(
  selectSource.includes('data-slot={dataSlot ?? "select"}'),
  "select source must expose stable root slot data.",
);
assert(
  selectSource.includes('data-slot="select-trigger"'),
  "select source must expose stable trigger slot data.",
);
assert(
  selectSource.includes('data-slot="select-value"'),
  "select source must expose stable value slot data.",
);
assert(
  selectSource.includes('data-slot="select-popover"'),
  "select source must expose stable popover slot data.",
);
assert(
  selectSource.includes('container.setAttribute("data-slot", "select-portal-container")'),
  "select source must expose stable portal host slot data.",
);
assert(
  selectSource.includes('data-slot="select-listbox"'),
  "select source must expose stable listbox slot data.",
);
assert(
  selectSource.includes('data-slot="select-item"'),
  "select source must expose stable item slot data.",
);
assert(
  selectSource.includes("return document.createElement(\"div\")") &&
    selectSource.includes("UNSTABLE_portalContainer={portalContainer ?? undefined}"),
  "select source must create an explicit provider-aware portal container before client popover rendering.",
);
assert(
  selectSource.includes("selectedText || defaultChildren"),
  "select source must render selected item text without item chrome.",
);
assert(
  selectSource.includes("type SelectComponent = (<T extends SelectItemData"),
  "select source must preserve generic item typing.",
);
assert(
  selectSource.includes("bg-background"),
  "select source must use tokenized background utilities.",
);
assert(
  selectSource.includes("border-input"),
  "select source must use tokenized input border utilities.",
);
assert(
  selectSource.includes("ring-ring"),
  "select source must use tokenized focus ring utilities.",
);
assert(
  selectSource.includes("text-destructive"),
  "select source must use tokenized destructive utilities.",
);
assert(
  selectSource.includes("h-density-control"),
  "select source must use provider density control utilities.",
);
assert(!selectSource.includes("@radix-ui"), "select source must remain Radix-free.");
assert(stackSource.includes('"data-slot": "stack"'), "stack source must expose stable slot data.");
assert(stackSource.includes("asChild"), "stack source must expose child composition.");
assert(stackSource.includes("stackClassNames"), "stack source must expose class-name composition.");
assert(stackSource.includes("flex-col"), "stack source must expose vertical direction utilities.");
assert(stackSource.includes("flex-row"), "stack source must expose horizontal direction utilities.");
assert(
  stackSource.includes("gap-[var(--dt-space-4)]"),
  "stack source must expose tokenized gap utilities.",
);
assert(stackSource.includes("items-center"), "stack source must expose alignment utilities.");
assert(stackSource.includes("justify-between"), "stack source must expose justification utilities.");
assert(stackSource.includes("flex-wrap"), "stack source must expose wrapping utilities.");
assert(!stackSource.includes("reverse"), "stack source must not expose visual reverse ordering.");
assert(!stackSource.includes("@radix-ui"), "stack source must remain dependency-free.");
assert(
  switchSource.includes('data-slot={dataSlot ?? "switch"}'),
  "switch source must expose stable root slot data.",
);
assert(
  switchSource.includes('data-slot="switch-input"'),
  "switch source must expose stable input slot data.",
);
assert(
  switchSource.includes('data-slot="switch-track"'),
  "switch source must expose stable track slot data.",
);
assert(
  switchSource.includes('data-slot="switch-thumb"'),
  "switch source must expose stable thumb slot data.",
);
assert(
  switchSource.includes("onCheckedChange"),
  "switch source must expose checked change callbacks.",
);
assert(
  switchSource.includes('role="switch"'),
  "switch source must expose switch semantics.",
);
assert(
  switchSource.includes("type=\"checkbox\""),
  "switch source must preserve native checkbox input behavior.",
);
assert(
  !switchSource.includes("indeterminate"),
  "switch source must remain binary-only.",
);
assert(
  switchSource.includes("border-input"),
  "switch source must use tokenized input border utilities.",
);
assert(
  switchSource.includes("--switch-height"),
  "switch source must use density-backed track sizing.",
);
assert(
  switchSource.includes("group-disabled/field-set:opacity-60"),
  "switch source must style inherited fieldset disabled state.",
);
assert(
  switchSource.includes("focus-visible:ring-2"),
  "switch source must include visible focus styling.",
);
assert(!switchSource.includes("@radix-ui"), "switch source must remain Radix-free.");
assert(
  typographySource.includes('"data-slot": "typography"'),
  "typography source must expose stable typography slot data.",
);
assert(
  typographySource.includes('"data-slot": "heading"'),
  "typography source must expose stable heading slot data.",
);
assert(
  typographySource.includes('"data-slot": "text"'),
  "typography source must expose stable text slot data.",
);
assert(
  typographySource.includes("headingElements"),
  "typography source must render native heading elements by level.",
);
assert(typographySource.includes("text-primary"), "typography source must use tokenized primary utilities.");
assert(typographySource.includes("text-start"), "typography source must use logical alignment utilities.");
assert(typographySource.includes("line-clamp-3"), "typography source must support line clamp utilities.");
assert(!typographySource.includes("@radix-ui"), "typography source must remain dependency-free.");
assert(
  dateTimePickerSource.includes("react-aria-components"),
  "date-time-picker source must use React Aria Components.",
);
assert(
  dateTimePickerSource.includes('data-slot="date-time-picker"'),
  "date-time-picker source must expose a stable root slot.",
);
assert(
  dateTimePickerSource.includes('data-slot="date-time-picker-field"'),
  "date-time-picker source must expose a stable field slot.",
);
assert(
  dateTimePickerSource.includes('data-slot="date-time-picker-calendar"'),
  "date-time-picker source must expose a stable calendar slot.",
);
assert(
  dateTimePickerSource.includes("border-input"),
  "date-time-picker source must use tokenized input border utilities.",
);
assert(
  dateTimePickerSource.includes("focus-visible:ring-2"),
  "date-time-picker source must include visible focus styling.",
);
assert(!dateTimePickerSource.includes("@radix-ui"), "date-time-picker source must not use Radix.");
assert(
  dialogSource.includes("react-aria-components"),
  "dialog source must use React Aria Components.",
);
assert(
  dialogSource.includes('data-slot={dataSlot ?? "dialog"}'),
  "dialog source must expose stable root slot data.",
);
assert(
  dialogSource.includes('data-slot="dialog-trigger"'),
  "dialog source must expose stable trigger slot data.",
);
assert(
  dialogSource.includes('data-slot="dialog-overlay"'),
  "dialog source must expose stable overlay slot data.",
);
assert(
  dialogSource.includes('data-slot="dialog-content"'),
  "dialog source must expose stable content slot data.",
);
assert(
  dialogSource.includes('data-slot="dialog-panel"'),
  "dialog source must expose stable panel slot data.",
);
assert(
  dialogSource.includes('data-slot="dialog-header"'),
  "dialog source must expose stable header slot data.",
);
assert(
  dialogSource.includes('data-slot="dialog-footer"'),
  "dialog source must expose stable footer slot data.",
);
assert(
  dialogSource.includes('data-slot="dialog-title"'),
  "dialog source must expose stable title slot data.",
);
assert(
  dialogSource.includes('data-slot="dialog-description"'),
  "dialog source must expose stable description slot data.",
);
assert(
  dialogSource.includes('data-slot="dialog-close"'),
  "dialog source must expose stable close slot data.",
);
assert(
  dialogSource.includes("showCloseButton"),
  "dialog source must expose optional content-level close button support.",
);
assert(
  dialogSource.includes("closeButtonLabel"),
  "dialog source must expose an accessible label for the content-level close button.",
);
assert(
  dialogSource.includes("dialogCloseButtonClassNames"),
  "dialog source must expose class-name composition for the content-level close button.",
);
assert(
  dialogSource.includes("end-[var(--dt-space-3)]"),
  "dialog source must position the content-level close button with logical end spacing.",
);
assert(
  dialogSource.includes("pe-[calc(var(--dt-space-6)+var(--dt-space-8))]"),
  "dialog source must reserve header inline space for the content-level close button.",
);
assert(
  dialogSource.includes('portalSlot: "dialog-portal-container"'),
  "dialog source must create an explicit provider-aware portal container.",
);
assert(
  dialogSource.includes("isDismissable={dismissible}"),
  "dialog source must expose outside-dismiss behavior.",
);
assert(
  dialogSource.includes("isKeyboardDismissDisabled={keyboardDismissDisabled}"),
  "dialog source must expose keyboard-dismiss control.",
);
assert(
  dialogSource.includes("shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}"),
  "dialog source must expose custom outside-interaction close guards.",
);
assert(
  dialogSource.includes("triggerElementRef.current?.focus()"),
  "dialog source must restore focus to the trigger on close.",
);
assert(
  dialogSource.includes("bg-background"),
  "dialog source must use tokenized background utilities.",
);
assert(
  dialogSource.includes("border-border"),
  "dialog source must use tokenized border utilities.",
);
assert(
  dialogSource.includes("motion-safe:transition"),
  "dialog source must use reduced-motion-aware transitions.",
);
assert(
  dialogSource.includes("100dvh") && dialogSource.includes("env(safe-area-inset-top)"),
  "dialog source must constrain viewport sizing with dynamic viewport and safe-area units.",
);
assert(
  providerPortalSource.includes("UNSAFE_PortalProvider"),
  "provider portal helper must use React Aria's provider-aware portal API.",
);
assert(
  providerPortalSource.includes("data-dethink-provider"),
  "provider portal helper must preserve the provider hook for inherited tokens.",
);
assert(
  providerPortalSource.includes('"data-theme"') &&
    providerPortalSource.includes('"data-density"') &&
    providerPortalSource.includes('"dir"'),
  "provider portal helper must mirror theme, density, and direction attributes.",
);
assert(
  providerPortalSource.includes("MutationObserver"),
  "provider portal helper must resync provider attribute changes.",
);
assert(!dialogSource.includes("@radix-ui"), "dialog source must remain Radix-free.");
assert(
  positionedOverlaySource.includes("positionedOverlayPopoverDefaults") &&
    positionedOverlaySource.includes("positionedOverlayTooltipDefaults") &&
    positionedOverlaySource.includes("positionedOverlayDropdownMenuDefaults"),
  "positioned overlay helper must expose component-specific overlay defaults.",
);
assert(
  positionedOverlaySource.includes("motion-safe:data-[entering]:animate-overlay-in") &&
    positionedOverlaySource.includes("motion-reduce:animate-none"),
  "positioned overlay helper must include reduced-motion-aware overlay classes.",
);
assert(
  popoverSource.includes("react-aria-components"),
  "popover source must use React Aria Components.",
);
assert(
  popoverSource.includes('portalSlot: "popover-portal-container"'),
  "popover source must use the provider-aware portal helper.",
);
assert(
  popoverSource.includes('data-slot={dataSlot ?? "popover"}') &&
    popoverSource.includes('data-slot="popover-trigger"') &&
    popoverSource.includes('data-slot="popover-content"') &&
    popoverSource.includes('data-slot="popover-panel"') &&
    popoverSource.includes('data-slot="popover-title"') &&
    popoverSource.includes('data-slot="popover-description"') &&
    popoverSource.includes('data-slot="popover-arrow"'),
  "popover source must expose stable overlay anatomy slots.",
);
assert(
  popoverSource.includes("positionedOverlaySurfaceClassNames") &&
    popoverSource.includes("focus-visible:outline-ring"),
  "popover source must use provider-level token utilities.",
);
assert(
  tooltipSource.includes("react-aria-components"),
  "tooltip source must use React Aria Components.",
);
assert(
  tooltipSource.includes('portalSlot: "tooltip-portal-container"'),
  "tooltip source must use the provider-aware portal helper.",
);
assert(
  tooltipSource.includes('data-slot={dataSlot ?? "tooltip"}') &&
    tooltipSource.includes('data-slot="tooltip-trigger"') &&
    tooltipSource.includes('data-slot="tooltip-content"') &&
    tooltipSource.includes('data-slot="tooltip-arrow"'),
  "tooltip source must expose stable overlay anatomy slots.",
);
assert(
  tooltipSource.includes("bg-foreground") &&
    tooltipSource.includes("text-background") &&
    tooltipSource.includes("positionedOverlaySurfaceClassNames"),
  "tooltip source must use provider tokens and reduced-motion-aware classes.",
);
assert(
  dropdownMenuSource.includes("react-aria-components"),
  "dropdown-menu source must use React Aria Components.",
);
assert(
  dropdownMenuSource.includes('portalSlot: "dropdown-menu-portal-container"'),
  "dropdown-menu source must use the provider-aware portal helper.",
);
assert(
  dropdownMenuSource.includes('data-slot={dataSlot ?? "dropdown-menu"}') &&
    dropdownMenuSource.includes('data-slot="dropdown-menu-trigger"') &&
    dropdownMenuSource.includes('contentSlot = "dropdown-menu-content"') &&
    dropdownMenuSource.includes('data-slot="dropdown-menu-menu"') &&
    dropdownMenuSource.includes('data-slot="dropdown-menu-item"') &&
    dropdownMenuSource.includes('data-slot="dropdown-menu-label"') &&
    dropdownMenuSource.includes('data-slot="dropdown-menu-separator"') &&
    dropdownMenuSource.includes("dropdown-menu-submenu-content") &&
    dropdownMenuSource.includes('data-slot="dropdown-menu-arrow"'),
  "dropdown-menu source must expose stable action-menu anatomy slots.",
);
assert(
  dropdownMenuSource.includes("isDisabled={disabled || undefined}") &&
    dropdownMenuSource.includes("data-destructive") &&
    dropdownMenuSource.includes("hasSubmenu"),
  "dropdown-menu source must support item disabled state, destructive items, and submenu state.",
);
assert(
  dropdownMenuSource.includes("positionedOverlaySurfaceClassNames") &&
    dropdownMenuSource.includes("text-destructive") &&
    dropdownMenuSource.includes("motion-safe:transition"),
  "dropdown-menu source must use provider tokens and reduced-motion-aware classes.",
);
for (const [name, source] of [
  ["popover", popoverSource],
  ["tooltip", tooltipSource],
  ["dropdown-menu", dropdownMenuSource],
]) {
  assert(!source.includes("@radix-ui"), `${name} source must remain Radix-free.`);
  assert(!source.includes("framer-motion"), `${name} source must not use Motion.`);
  assert(!source.includes("floating-ui"), `${name} source must not use Floating UI.`);
}
assert(timelineSource.includes("data-slot=\"timeline\""), "timeline source must expose stable root slot data.");
assert(timelineSource.includes("data-slot=\"timeline-viewport\""), "timeline source must expose viewport slot data.");
assert(timelineSource.includes("<ol"), "timeline source must render an ordered list.");
assert(timelineSource.includes("<time"), "timeline source must render machine-readable time elements.");
assert(timelineSource.includes("bg-primary"), "timeline source must use tokenized primary utilities.");
assert(timelineSource.includes("bg-success"), "timeline source must use tokenized success utilities.");
assert(
  timelineSource.includes("border-timeline-border"),
  "timeline source must use timeline border token utilities.",
);
assert(
  timelineSource.includes("bg-timeline-rail"),
  "timeline source must use timeline rail token utilities.",
);
assert(!timelineSource.includes("@radix-ui"), "timeline source must remain dependency-free.");

console.log("Registry smoke passed.");
