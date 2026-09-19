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
  const registryFilePaths = new Set(
    (item.files ?? []).map((file) => normalize(file.path)),
  );

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
const buttonGroup = await readJson(join(registryRoot, "button-group.json"));
const dropdownButton = await readJson(
  join(registryRoot, "dropdown-button.json"),
);
const card = await readJson(join(registryRoot, "card.json"));
const cardStack = await readJson(join(registryRoot, "card-stack.json"));
const checkbox = await readJson(join(registryRoot, "checkbox.json"));
const combobox = await readJson(join(registryRoot, "combobox.json"));
const commandPalette = await readJson(
  join(registryRoot, "command-palette.json"),
);
const multiSelect = await readJson(join(registryRoot, "multi-select.json"));
const asyncSelect = await readJson(join(registryRoot, "async-select.json"));
const tagInput = await readJson(join(registryRoot, "tag-input.json"));
const container = await readJson(join(registryRoot, "container.json"));
const dialog = await readJson(join(registryRoot, "dialog.json"));
const drawer = await readJson(join(registryRoot, "drawer.json"));
const formField = await readJson(join(registryRoot, "form-field.json"));
const input = await readJson(join(registryRoot, "input.json"));
const iconButton = await readJson(join(registryRoot, "icon-button.json"));
const revealButton = await readJson(join(registryRoot, "reveal-button.json"));
const soundInput = await readJson(join(registryRoot, "sound-input.json"));
const flex = await readJson(join(registryRoot, "flex.json"));
const grid = await readJson(join(registryRoot, "grid.json"));
const link = await readJson(join(registryRoot, "link.json"));
const numberInput = await readJson(join(registryRoot, "number-input.json"));
const popover = await readJson(join(registryRoot, "popover.json"));
const radioGroup = await readJson(join(registryRoot, "radio-group.json"));
const separator = await readJson(join(registryRoot, "separator.json"));
const select = await readJson(join(registryRoot, "select.json"));
const stack = await readJson(join(registryRoot, "stack.json"));
const steps = await readJson(join(registryRoot, "steps.json"));
const switchItem = await readJson(join(registryRoot, "switch.json"));
const table = await readJson(join(registryRoot, "table.json"));
const tabs = await readJson(join(registryRoot, "tabs.json"));
const dataTable = await readJson(join(registryRoot, "data-table.json"));
const calendar = await readJson(join(registryRoot, "calendar.json"));
const datePicker = await readJson(join(registryRoot, "date-picker.json"));
const dateRangePicker = await readJson(
  join(registryRoot, "date-range-picker.json"),
);
const textarea = await readJson(join(registryRoot, "textarea.json"));
const tooltip = await readJson(join(registryRoot, "tooltip.json"));
const dropdownMenu = await readJson(join(registryRoot, "dropdown-menu.json"));
const navigationMenu = await readJson(
  join(registryRoot, "navigation-menu.json"),
);
const navDock = await readJson(join(registryRoot, "navdock.json"));
const sidebar = await readJson(join(registryRoot, "sidebar.json"));
const sidebarShell = await readJson(join(registryRoot, "sidebar-shell.json"));
const pagination = await readJson(join(registryRoot, "pagination.json"));
const typography = await readJson(join(registryRoot, "typography.json"));
const dateTimePicker = await readJson(
  join(registryRoot, "date-time-picker.json"),
);
const timeline = await readJson(join(registryRoot, "timeline.json"));
const slotPlanner = await readJson(join(registryRoot, "slot-planner.json"));
const liveRegion = await readJson(join(registryRoot, "live-region.json"));
const spinner = await readJson(join(registryRoot, "spinner.json"));
const progress = await readJson(join(registryRoot, "progress.json"));
const skeleton = await readJson(join(registryRoot, "skeleton.json"));
const alert = await readJson(join(registryRoot, "alert.json"));
const emptyState = await readJson(join(registryRoot, "empty-state.json"));
const toast = await readJson(join(registryRoot, "toast.json"));
const feedbackStates = await readJson(
  join(registryRoot, "feedback-states.json"),
);

const registryItemsByName = new Map(
  [
    base,
    box,
    button,
    buttonGroup,
    dropdownButton,
    card,
    cardStack,
    checkbox,
    combobox,
    commandPalette,
    multiSelect,
    asyncSelect,
    tagInput,
    container,
    dialog,
    drawer,
    formField,
    input,
    iconButton,
    revealButton,
    soundInput,
    flex,
    grid,
    link,
    numberInput,
    popover,
    radioGroup,
    separator,
    select,
    stack,
    steps,
    switchItem,
    table,
    tabs,
    dataTable,
    calendar,
    datePicker,
    dateRangePicker,
    textarea,
    tooltip,
    dropdownMenu,
    navigationMenu,
    navDock,
    sidebar,
    sidebarShell,
    pagination,
    typography,
    dateTimePicker,
    timeline,
    slotPlanner,
    liveRegion,
    spinner,
    progress,
    skeleton,
    alert,
    emptyState,
    toast,
    feedbackStates,
  ].map((item) => [item.name, item]),
);

assert(box.name === "box", "box registry item must be named box.");
assert(button.name === "button", "button registry item must be named button.");
assert(
  buttonGroup.name === "button-group",
  "button-group registry item must be named button-group.",
);
assert(
  dropdownButton.name === "dropdown-button",
  "dropdown-button registry item must be named dropdown-button.",
);
assert(card.name === "card", "card registry item must be named card.");
assert(
  cardStack.name === "card-stack",
  "card-stack registry item must be named card-stack.",
);
assert(
  checkbox.name === "checkbox",
  "checkbox registry item must be named checkbox.",
);
assert(
  combobox.name === "combobox",
  "combobox registry item must be named combobox.",
);
assert(
  commandPalette.name === "command-palette",
  "command-palette registry item must be named command-palette.",
);
assert(
  multiSelect.name === "multi-select",
  "multi-select registry item must be named multi-select.",
);
assert(
  asyncSelect.name === "async-select",
  "async-select registry item must be named async-select.",
);
assert(
  tagInput.name === "tag-input",
  "tag-input registry item must be named tag-input.",
);
assert(
  container.name === "container",
  "container registry item must be named container.",
);
assert(dialog.name === "dialog", "dialog registry item must be named dialog.");
assert(drawer.name === "drawer", "drawer registry item must be named drawer.");
assert(
  formField.name === "form-field",
  "form-field registry item must be named form-field.",
);
assert(input.name === "input", "input registry item must be named input.");
assert(
  iconButton.name === "icon-button",
  "icon-button registry item must be named icon-button.",
);
assert(
  revealButton.name === "reveal-button",
  "reveal-button registry item must be named reveal-button.",
);
assert(
  soundInput.name === "sound-input",
  "sound-input registry item must be named sound-input.",
);
assert(flex.name === "flex", "flex registry item must be named flex.");
assert(grid.name === "grid", "grid registry item must be named grid.");
assert(link.name === "link", "link registry item must be named link.");
assert(
  numberInput.name === "number-input",
  "number-input registry item must be named number-input.",
);
assert(
  popover.name === "popover",
  "popover registry item must be named popover.",
);
assert(
  radioGroup.name === "radio-group",
  "radio-group registry item must be named radio-group.",
);
assert(
  separator.name === "separator",
  "separator registry item must be named separator.",
);
assert(select.name === "select", "select registry item must be named select.");
assert(stack.name === "stack", "stack registry item must be named stack.");
assert(steps.name === "steps", "steps registry item must be named steps.");
assert(
  switchItem.name === "switch",
  "switch registry item must be named switch.",
);
assert(table.name === "table", "table registry item must be named table.");
assert(tabs.name === "tabs", "tabs registry item must be named tabs.");
assert(
  dataTable.name === "data-table",
  "data-table registry item must be named data-table.",
);
assert(
  calendar.name === "calendar",
  "calendar registry item must be named calendar.",
);
assert(
  datePicker.name === "date-picker",
  "date-picker registry item must be named date-picker.",
);
assert(
  dateRangePicker.name === "date-range-picker",
  "date-range-picker registry item must be named date-range-picker.",
);
assert(
  textarea.name === "textarea",
  "textarea registry item must be named textarea.",
);
assert(
  tooltip.name === "tooltip",
  "tooltip registry item must be named tooltip.",
);
assert(
  dropdownMenu.name === "dropdown-menu",
  "dropdown-menu registry item must be named dropdown-menu.",
);
assert(
  navigationMenu.name === "navigation-menu",
  "navigation-menu registry item must be named navigation-menu.",
);
assert(
  navDock.name === "navdock",
  "navdock registry item must be named navdock.",
);
assert(
  pagination.name === "pagination",
  "pagination registry item must be named pagination.",
);
assert(
  typography.name === "typography",
  "typography registry item must be named typography.",
);
assert(
  dateTimePicker.name === "date-time-picker",
  "date-time-picker registry item must be named date-time-picker.",
);
assert(
  timeline.name === "timeline",
  "timeline registry item must be named timeline.",
);
assert(
  liveRegion.name === "live-region",
  "live-region registry item must be named live-region.",
);
assert(
  spinner.name === "spinner",
  "spinner registry item must be named spinner.",
);
assert(
  progress.name === "progress",
  "progress registry item must be named progress.",
);
assert(
  skeleton.name === "skeleton",
  "skeleton registry item must be named skeleton.",
);
assert(alert.name === "alert", "alert registry item must be named alert.");
assert(
  emptyState.name === "empty-state",
  "empty-state registry item must be named empty-state.",
);
assert(toast.name === "toast", "toast registry item must be named toast.");
assert(
  feedbackStates.name === "feedback-states",
  "feedback-states registry item must be named feedback-states.",
);
assert(
  slotPlanner.name === "slot-planner",
  "slot-planner registry item must be named slot-planner.",
);
assert(
  box.registryDependencies?.includes("dethink-base"),
  "box registry item must depend on dethink-base.",
);
assert(
  button.registryDependencies?.includes("dethink-base"),
  "button registry item must depend on dethink-base.",
);
assert(
  buttonGroup.registryDependencies?.includes("dethink-base") &&
    buttonGroup.registryDependencies?.includes("button") &&
    buttonGroup.registryDependencies?.includes("icon-button"),
  "button-group registry item must include base Button and IconButton dependencies.",
);
assert(
  !buttonGroup.registryDependencies?.includes("dropdown-menu"),
  "button-group registry item must not depend on dropdown-menu.",
);
assert(
  dropdownButton.registryDependencies?.includes("button") &&
    dropdownButton.registryDependencies?.includes("button-group") &&
    dropdownButton.registryDependencies?.includes("dropdown-menu") &&
    dropdownButton.registryDependencies?.includes("dethink-base"),
  "dropdown-button registry item must include Button, ButtonGroup, DropdownMenu, and base dependencies.",
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
  commandPalette.registryDependencies?.includes("dethink-base"),
  "command-palette registry item must depend on dethink-base.",
);
assert(
  commandPalette.registryDependencies?.includes("button"),
  "command-palette registry item must depend on button for shared trigger styling.",
);
assert(
  commandPalette.registryDependencies?.includes("dialog"),
  "command-palette registry item must depend on dialog for modal mode.",
);
assert(
  multiSelect.registryDependencies?.includes("dethink-base"),
  "multi-select registry item must depend on dethink-base.",
);
assert(
  asyncSelect.registryDependencies?.includes("dethink-base"),
  "async-select registry item must depend on dethink-base.",
);
assert(
  asyncSelect.registryDependencies?.includes("combobox"),
  "async-select registry item must depend on combobox for single-select rendering.",
);
assert(
  asyncSelect.registryDependencies?.includes("multi-select"),
  "async-select registry item must depend on multi-select for multi-value rendering.",
);
assert(
  tagInput.registryDependencies?.includes("dethink-base"),
  "tag-input registry item must depend on dethink-base.",
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
  drawer.registryDependencies?.includes("dethink-base"),
  "drawer registry item must depend on dethink-base.",
);
assert(
  drawer.registryDependencies?.includes("button"),
  "drawer registry item must depend on button for shared trigger and close styling.",
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
  revealButton.registryDependencies?.includes("dethink-base"),
  "reveal-button registry item must depend on dethink-base.",
);
assert(
  revealButton.registryDependencies?.includes("button"),
  "reveal-button registry item must depend on button for shared variant types.",
);
assert(
  soundInput.registryDependencies?.includes("dethink-base"),
  "sound-input registry item must depend on dethink-base.",
);
assert(
  soundInput.registryDependencies?.includes("button"),
  "sound-input registry item must depend on button for shared variant types.",
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
  steps.registryDependencies?.includes("dethink-base"),
  "steps registry item must depend on dethink-base.",
);
assert(
  switchItem.registryDependencies?.includes("dethink-base"),
  "switch registry item must depend on dethink-base.",
);
assert(
  table.registryDependencies?.includes("dethink-base"),
  "table registry item must depend on dethink-base.",
);
assert(
  tabs.registryDependencies?.includes("dethink-base"),
  "tabs registry item must depend on dethink-base.",
);
assert(
  dataTable.registryDependencies?.includes("dethink-base"),
  "data-table registry item must depend on dethink-base.",
);
assert(
  dataTable.registryDependencies?.includes("table"),
  "data-table registry item must depend on table for semantic table rendering.",
);
assert(
  dataTable.registryDependencies?.includes("button"),
  "data-table registry item must depend on button for pagination and action controls.",
);
assert(
  dataTable.registryDependencies?.includes("checkbox"),
  "data-table registry item must depend on checkbox for row selection controls.",
);
assert(
  dataTable.registryDependencies?.includes("input"),
  "data-table registry item must depend on input for filtering controls.",
);
assert(
  calendar.registryDependencies?.includes("dethink-base"),
  "calendar registry item must depend on dethink-base.",
);
assert(
  datePicker.registryDependencies?.includes("dethink-base"),
  "date-picker registry item must depend on dethink-base.",
);
assert(
  datePicker.registryDependencies?.includes("calendar"),
  "date-picker registry item must depend on calendar for shared date grid rendering.",
);
assert(
  dateRangePicker.registryDependencies?.includes("dethink-base"),
  "date-range-picker registry item must depend on dethink-base.",
);
assert(
  dateRangePicker.registryDependencies?.includes("calendar"),
  "date-range-picker registry item must depend on calendar for shared range grid rendering.",
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
  navigationMenu.registryDependencies?.includes("dethink-base"),
  "navigation-menu registry item must depend on dethink-base.",
);
assert(
  navDock.registryDependencies?.includes("dethink-base"),
  "navdock registry item must depend on dethink-base.",
);
assert(
  pagination.registryDependencies?.includes("dethink-base"),
  "pagination registry item must depend on dethink-base.",
);
assert(
  (navigationMenu.dependencies ?? []).length === 0,
  "navigation-menu registry item must not declare runtime dependencies (no Motion).",
);
assert(
  navDock.dependencies?.includes("motion"),
  "navdock registry item must include motion for dock magnification and collapsed rail animation.",
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
  dateTimePicker.registryDependencies?.includes("calendar"),
  "date-time-picker registry item must depend on calendar for shared date grid rendering.",
);
assert(
  timeline.registryDependencies?.includes("dethink-base"),
  "timeline registry item must depend on dethink-base.",
);
assert(
  slotPlanner.registryDependencies?.includes("dethink-base"),
  "slot-planner registry item must depend on dethink-base.",
);
for (const dependencyName of [
  "button",
  "checkbox",
  "dialog",
  "form-field",
  "input",
  "number-input",
  "radio-group",
  "select",
  "tag-input",
  "textarea",
]) {
  assert(
    slotPlanner.registryDependencies?.includes(dependencyName),
    `slot-planner registry item must depend on ${dependencyName} for the editor and confirm dialogs.`,
  );
}
assert(
  liveRegion.registryDependencies?.includes("dethink-base"),
  "live-region registry item must depend on dethink-base.",
);
assert(
  spinner.registryDependencies?.includes("dethink-base"),
  "spinner registry item must depend on dethink-base.",
);
assert(
  progress.registryDependencies?.includes("dethink-base"),
  "progress registry item must depend on dethink-base.",
);
assert(
  skeleton.registryDependencies?.includes("dethink-base"),
  "skeleton registry item must depend on dethink-base.",
);
assert(
  alert.registryDependencies?.includes("dethink-base"),
  "alert registry item must depend on dethink-base.",
);
assert(
  emptyState.registryDependencies?.includes("dethink-base"),
  "empty-state registry item must depend on dethink-base.",
);
assert(
  emptyState.registryDependencies?.includes("alert"),
  "empty-state registry item must depend on alert for shared tone types.",
);
assert(
  toast.registryDependencies?.includes("dethink-base"),
  "toast registry item must depend on dethink-base.",
);
assert(
  toast.registryDependencies?.includes("live-region"),
  "toast registry item must depend on live-region for announcements.",
);
assert(
  toast.registryDependencies?.includes("alert"),
  "toast registry item must depend on alert for shared tone types.",
);
assert(
  feedbackStates.registryDependencies?.includes("live-region"),
  "feedback-states registry item must depend on live-region.",
);
assert(
  feedbackStates.registryDependencies?.includes("spinner"),
  "feedback-states registry item must depend on spinner.",
);
assert(
  feedbackStates.registryDependencies?.includes("progress"),
  "feedback-states registry item must depend on progress.",
);
assert(
  feedbackStates.registryDependencies?.includes("skeleton"),
  "feedback-states registry item must depend on skeleton.",
);
assert(
  feedbackStates.registryDependencies?.includes("alert"),
  "feedback-states registry item must depend on alert.",
);
assert(
  feedbackStates.registryDependencies?.includes("empty-state"),
  "feedback-states registry item must depend on empty-state.",
);
assert(
  feedbackStates.registryDependencies?.includes("toast"),
  "feedback-states registry item must depend on toast.",
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
  Array.isArray(buttonGroup.dependencies) &&
    buttonGroup.dependencies.length === 0,
  "button-group registry item must not add runtime dependencies, including Motion.",
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
  combobox.dependencies?.includes("react-aria"),
  "combobox registry item must include react-aria for portal provider support.",
);
assert(
  commandPalette.dependencies?.includes("motion"),
  "command-palette registry item must include motion for result and page choreography.",
);
assert(
  commandPalette.dependencies?.includes("react-aria"),
  "command-palette registry item must include react-aria through dialog mode.",
);
assert(
  commandPalette.dependencies?.includes("react-aria-components"),
  "command-palette registry item must include react-aria-components through dialog mode.",
);
assert(
  multiSelect.dependencies?.includes("react-aria-components"),
  "multi-select registry item must include react-aria-components.",
);
assert(
  multiSelect.dependencies?.includes("react-aria"),
  "multi-select registry item must include react-aria for portal provider support.",
);
assert(
  asyncSelect.dependencies?.includes("react-aria-components"),
  "async-select registry item must include react-aria-components through its selection primitives.",
);
assert(
  asyncSelect.dependencies?.includes("react-aria"),
  "async-select registry item must include react-aria through its selection primitives.",
);
assert(
  tagInput.dependencies?.includes("react-aria-components"),
  "tag-input registry item must include react-aria-components.",
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
  drawer.dependencies?.includes("motion"),
  "drawer registry item must include motion for drag/spring, background scale, edge-swipe, nested-recede, and shared-element behavior.",
);
assert(
  drawer.dependencies?.includes("react-aria"),
  "drawer registry item must include react-aria through its modal-mode substrate.",
);
assert(
  drawer.dependencies?.includes("react-aria-components"),
  "drawer registry item must include react-aria-components through its modal-mode substrate.",
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
  Array.isArray(iconButton.dependencies) &&
    iconButton.dependencies.length === 0,
  "icon-button registry item must not add runtime dependencies.",
);
assert(
  revealButton.dependencies?.includes("motion"),
  "reveal-button registry item must include motion for hover, focus, and press choreography.",
);
assert(
  soundInput.dependencies?.includes("motion"),
  "sound-input registry item must include motion for pill and waveform choreography.",
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
  Array.isArray(numberInput.dependencies) &&
    numberInput.dependencies.length === 0,
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
  Array.isArray(radioGroup.dependencies) &&
    radioGroup.dependencies.length === 0,
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
  select.dependencies?.includes("react-aria"),
  "select registry item must include react-aria for portal provider support.",
);
assert(
  Array.isArray(stack.dependencies) && stack.dependencies.length === 0,
  "stack registry item must not add runtime dependencies.",
);
assert(
  steps.dependencies?.includes("motion"),
  "steps registry item must include motion for branch and progress choreography.",
);
assert(
  Array.isArray(switchItem.dependencies) &&
    switchItem.dependencies.length === 0,
  "switch registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(table.dependencies) && table.dependencies.length === 0,
  "table registry item must not add runtime dependencies.",
);
assert(
  tabs.dependencies?.includes("motion"),
  "tabs registry item must include motion for the shared-layout active layer.",
);
assert(
  dataTable.dependencies?.includes("@tanstack/react-table"),
  "data-table registry item must include @tanstack/react-table.",
);
assert(
  calendar.dependencies?.includes("@internationalized/date"),
  "calendar registry item must include @internationalized/date.",
);
assert(
  calendar.dependencies?.includes("react-aria-components"),
  "calendar registry item must include react-aria-components.",
);
assert(
  datePicker.dependencies?.includes("@internationalized/date"),
  "date-picker registry item must include @internationalized/date.",
);
assert(
  datePicker.dependencies?.includes("react-aria"),
  "date-picker registry item must include react-aria for portal provider support.",
);
assert(
  datePicker.dependencies?.includes("react-aria-components"),
  "date-picker registry item must include react-aria-components.",
);
assert(
  dateRangePicker.dependencies?.includes("@internationalized/date"),
  "date-range-picker registry item must include @internationalized/date.",
);
assert(
  dateRangePicker.dependencies?.includes("react-aria"),
  "date-range-picker registry item must include react-aria for portal provider support.",
);
assert(
  dateRangePicker.dependencies?.includes("react-aria-components"),
  "date-range-picker registry item must include react-aria-components.",
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
  dropdownMenu.dependencies?.includes("motion"),
  "dropdown-menu registry item must include Motion for surface presence and item feedback.",
);
assert(
  dropdownButton.dependencies?.includes("motion"),
  "dropdown-button must include Motion for open-state chevron feedback.",
);
assert(
  dropdownButton.dependencies?.includes("lucide-react"),
  "dropdown-button must include lucide-react for its selected-action check indicator.",
);
assert(
  Array.isArray(typography.dependencies) &&
    typography.dependencies.length === 0,
  "typography registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(pagination.dependencies) &&
    pagination.dependencies.length === 0,
  "pagination registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(timeline.dependencies) && timeline.dependencies.length === 0,
  "timeline registry item must not add runtime dependencies.",
);
assert(
  slotPlanner.dependencies?.includes("motion"),
  "slot-planner registry item must include motion for week, selection, and slot choreography.",
);
assert(
  slotPlanner.dependencies?.includes("@internationalized/date"),
  "slot-planner registry item must include @internationalized/date for zone-aware date math.",
);
assert(
  slotPlanner.files?.some((file) =>
    file.path.endsWith("slot-planner/slot-planner-fixtures.ts"),
  ),
  "slot-planner registry item must copy the canonical fixtures module so demos work after install.",
);
assert(
  dateTimePicker.dependencies?.includes("@internationalized/date"),
  "date-time-picker registry item must include @internationalized/date.",
);
assert(
  dateTimePicker.dependencies?.includes("react-aria"),
  "date-time-picker registry item must include react-aria for portal provider support.",
);
assert(
  dateTimePicker.dependencies?.includes("react-aria-components"),
  "date-time-picker registry item must include react-aria-components.",
);
assert(
  Array.isArray(liveRegion.dependencies) &&
    liveRegion.dependencies.length === 0,
  "live-region registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(spinner.dependencies) && spinner.dependencies.length === 0,
  "spinner registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(progress.dependencies) && progress.dependencies.length === 0,
  "progress registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(skeleton.dependencies) && skeleton.dependencies.length === 0,
  "skeleton registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(alert.dependencies) && alert.dependencies.length === 0,
  "alert registry item must not add runtime dependencies.",
);
assert(
  Array.isArray(emptyState.dependencies) &&
    emptyState.dependencies.length === 0,
  "empty-state registry item must not add runtime dependencies.",
);
assert(
  toast.dependencies?.includes("motion"),
  "toast registry item must include motion for stack presence and layout compaction.",
);
assert(
  Array.isArray(feedbackStates.dependencies) &&
    feedbackStates.dependencies.length === 0,
  "feedback-states registry item should receive runtime dependencies through its child items.",
);
assert(
  sidebar.dependencies?.includes("motion"),
  "sidebar registry item must include Motion for structural choreography.",
);
assert(
  sidebarShell.dependencies?.includes("motion") &&
    sidebarShell.registryDependencies?.includes("sidebar") &&
    sidebarShell.registryDependencies?.includes("dethink-base"),
  "sidebar-shell registry item must include Motion and its Sidebar/base registry dependencies.",
);

for (const item of [
  base,
  box,
  button,
  buttonGroup,
  dropdownButton,
  card,
  cardStack,
  checkbox,
  combobox,
  commandPalette,
  multiSelect,
  asyncSelect,
  tagInput,
  container,
  dialog,
  formField,
  input,
  iconButton,
  revealButton,
  soundInput,
  flex,
  grid,
  link,
  numberInput,
  popover,
  radioGroup,
  separator,
  select,
  stack,
  steps,
  switchItem,
  table,
  tabs,
  dataTable,
  calendar,
  datePicker,
  dateRangePicker,
  textarea,
  tooltip,
  dropdownMenu,
  navigationMenu,
  navDock,
  sidebar,
  sidebarShell,
  pagination,
  typography,
  dateTimePicker,
  timeline,
  slotPlanner,
  liveRegion,
  spinner,
  progress,
  skeleton,
  alert,
  emptyState,
  toast,
  feedbackStates,
]) {
  for (const file of item.files ?? []) {
    await assertFileExists(join(root, file.path));
  }
}

await assertRegistryRelativeImportsResolve(container, registryItemsByName);
await assertRegistryRelativeImportsResolve(buttonGroup, registryItemsByName);
await assertRegistryRelativeImportsResolve(dropdownButton, registryItemsByName);
await assertRegistryRelativeImportsResolve(card, registryItemsByName);
await assertRegistryRelativeImportsResolve(cardStack, registryItemsByName);
await assertRegistryRelativeImportsResolve(checkbox, registryItemsByName);
await assertRegistryRelativeImportsResolve(combobox, registryItemsByName);
await assertRegistryRelativeImportsResolve(commandPalette, registryItemsByName);
await assertRegistryRelativeImportsResolve(multiSelect, registryItemsByName);
await assertRegistryRelativeImportsResolve(asyncSelect, registryItemsByName);
await assertRegistryRelativeImportsResolve(tagInput, registryItemsByName);
await assertRegistryRelativeImportsResolve(dialog, registryItemsByName);
await assertRegistryRelativeImportsResolve(drawer, registryItemsByName);
await assertRegistryRelativeImportsResolve(formField, registryItemsByName);
await assertRegistryRelativeImportsResolve(input, registryItemsByName);
await assertRegistryRelativeImportsResolve(revealButton, registryItemsByName);
await assertRegistryRelativeImportsResolve(soundInput, registryItemsByName);
await assertRegistryRelativeImportsResolve(grid, registryItemsByName);
await assertRegistryRelativeImportsResolve(numberInput, registryItemsByName);
await assertRegistryRelativeImportsResolve(popover, registryItemsByName);
await assertRegistryRelativeImportsResolve(radioGroup, registryItemsByName);
await assertRegistryRelativeImportsResolve(separator, registryItemsByName);
await assertRegistryRelativeImportsResolve(select, registryItemsByName);
await assertRegistryRelativeImportsResolve(switchItem, registryItemsByName);
await assertRegistryRelativeImportsResolve(steps, registryItemsByName);
await assertRegistryRelativeImportsResolve(table, registryItemsByName);
await assertRegistryRelativeImportsResolve(tabs, registryItemsByName);
await assertRegistryRelativeImportsResolve(dataTable, registryItemsByName);
await assertRegistryRelativeImportsResolve(calendar, registryItemsByName);
await assertRegistryRelativeImportsResolve(datePicker, registryItemsByName);
await assertRegistryRelativeImportsResolve(
  dateRangePicker,
  registryItemsByName,
);
await assertRegistryRelativeImportsResolve(textarea, registryItemsByName);
await assertRegistryRelativeImportsResolve(tooltip, registryItemsByName);
await assertRegistryRelativeImportsResolve(dropdownMenu, registryItemsByName);
await assertRegistryRelativeImportsResolve(dateTimePicker, registryItemsByName);
await assertRegistryRelativeImportsResolve(navigationMenu, registryItemsByName);
await assertRegistryRelativeImportsResolve(navDock, registryItemsByName);
await assertRegistryRelativeImportsResolve(sidebar, registryItemsByName);
await assertRegistryRelativeImportsResolve(sidebarShell, registryItemsByName);
await assertRegistryRelativeImportsResolve(slotPlanner, registryItemsByName);
await assertRegistryRelativeImportsResolve(pagination, registryItemsByName);
await assertRegistryRelativeImportsResolve(liveRegion, registryItemsByName);
await assertRegistryRelativeImportsResolve(spinner, registryItemsByName);
await assertRegistryRelativeImportsResolve(progress, registryItemsByName);
await assertRegistryRelativeImportsResolve(skeleton, registryItemsByName);
await assertRegistryRelativeImportsResolve(alert, registryItemsByName);
await assertRegistryRelativeImportsResolve(emptyState, registryItemsByName);
await assertRegistryRelativeImportsResolve(toast, registryItemsByName);
await assertRegistryRelativeImportsResolve(feedbackStates, registryItemsByName);

const stylePath = base.files.find(
  (file) => file.type === "registry:style",
)?.path;
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
const buttonGroupSource = await readFile(
  join(
    root,
    "packages/components/src/components/button-group/button-group.tsx",
  ),
  "utf8",
);
const dropdownButtonSource = await readFile(
  join(
    root,
    "packages/components/src/components/dropdown-button/dropdown-button.tsx",
  ),
  "utf8",
);
const responsiveActionRecipeSource = await readFile(
  join(
    root,
    "apps/showcase/src/examples/button-group/responsive-action-handoff.tsx",
  ),
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
const commandPaletteSource = await readFile(
  join(
    root,
    "packages/components/src/components/command-palette/command-palette.tsx",
  ),
  "utf8",
);
const commandPaletteIndexSource = await readFile(
  join(root, "packages/components/src/components/command-palette/index.ts"),
  "utf8",
);
const packageIndexSource = await readFile(
  join(root, "packages/components/src/index.ts"),
  "utf8",
);
const multiSelectSource = await readFile(
  join(
    root,
    "packages/components/src/components/multi-select/multi-select.tsx",
  ),
  "utf8",
);
const asyncSelectSource = await readFile(
  join(
    root,
    "packages/components/src/components/async-select/async-select.tsx",
  ),
  "utf8",
);
const tagInputSource = await readFile(
  join(root, "packages/components/src/components/tag-input/tag-input.tsx"),
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
const revealButtonSource = await readFile(
  join(
    root,
    "packages/components/src/components/reveal-button/reveal-button.tsx",
  ),
  "utf8",
);
const soundInputSource = await readFile(
  join(root, "packages/components/src/components/sound-input/sound-input.tsx"),
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
const stepsSource = await readFile(
  join(root, "packages/components/src/components/steps/steps.tsx"),
  "utf8",
);
const switchSource = await readFile(
  join(root, "packages/components/src/components/switch/switch.tsx"),
  "utf8",
);
const tableSource = await readFile(
  join(root, "packages/components/src/components/table/table.tsx"),
  "utf8",
);
const tabsSource = await readFile(
  join(root, "packages/components/src/components/tabs/tabs.tsx"),
  "utf8",
);
const dataTableSource = await readFile(
  join(root, "packages/components/src/components/data-table/data-table.tsx"),
  "utf8",
);
const calendarSource = await readFile(
  join(root, "packages/components/src/components/calendar/calendar.tsx"),
  "utf8",
);
const datePickerSource = await readFile(
  join(root, "packages/components/src/components/date-picker/date-picker.tsx"),
  "utf8",
);
const dateRangePickerSource = await readFile(
  join(
    root,
    "packages/components/src/components/date-range-picker/date-range-picker.tsx",
  ),
  "utf8",
);
const tooltipSource = await readFile(
  join(root, "packages/components/src/components/tooltip/tooltip.tsx"),
  "utf8",
);
const dropdownMenuSource = await readFile(
  join(
    root,
    "packages/components/src/components/dropdown-menu/dropdown-menu.tsx",
  ),
  "utf8",
);
const typographySource = await readFile(
  join(root, "packages/components/src/components/typography/typography.tsx"),
  "utf8",
);
const dateTimePickerSource = await readFile(
  join(
    root,
    "packages/components/src/components/date-time-picker/date-time-picker.tsx",
  ),
  "utf8",
);
const dialogSource = await readFile(
  join(root, "packages/components/src/components/dialog/dialog.tsx"),
  "utf8",
);
const drawerSource = await readFile(
  join(root, "packages/components/src/components/drawer/drawer.tsx"),
  "utf8",
);
const drawerMotionSource = await readFile(
  join(root, "packages/components/src/components/drawer/drawer-motion.tsx"),
  "utf8",
);
const drawerBackgroundScaleSource = await readFile(
  join(
    root,
    "packages/components/src/components/drawer/drawer-background-scale.ts",
  ),
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
const slotPlannerSource = await readFile(
  join(
    root,
    "packages/components/src/components/slot-planner/slot-planner.tsx",
  ),
  "utf8",
);
const slotPickerSource = await readFile(
  join(root, "packages/components/src/components/slot-planner/slot-picker.tsx"),
  "utf8",
);
const slotPlannerIndexSource = await readFile(
  join(root, "packages/components/src/components/slot-planner/index.ts"),
  "utf8",
);
const paginationSource = await readFile(
  join(root, "packages/components/src/components/pagination/pagination.tsx"),
  "utf8",
);

assert(
  styles.includes('@import "tailwindcss";'),
  "base styles must import Tailwind.",
);
assert(
  styles.includes("@source"),
  "base styles must register component sources.",
);
assert(
  styles.includes("@theme"),
  "base styles must define Tailwind theme tokens.",
);
assert(
  styles.includes("--color-primary"),
  "base styles must expose primary token.",
);
assert(
  styles.includes("--spacing-density-control"),
  "base styles must expose density token.",
);
assert(
  styles.includes("--color-timeline-border"),
  "base styles must expose timeline border token.",
);
assert(
  styles.includes("--color-timeline-rail"),
  "base styles must expose timeline rail token.",
);
assert(
  styles.includes("dt-progress-indeterminate"),
  "base styles must include feedback progress indeterminate keyframes.",
);
assert(
  styles.includes("dt-skeleton-shimmer"),
  "base styles must include feedback skeleton shimmer keyframes.",
);
assert(
  packageIndexSource.includes("LiveRegionProvider"),
  "package index must export LiveRegionProvider.",
);
assert(
  packageIndexSource.includes("ProgressCircle"),
  "package index must export ProgressCircle.",
);
assert(
  packageIndexSource.includes("ToastProvider"),
  "package index must export ToastProvider.",
);
assert(
  paginationSource.includes("getPaginationRenderItems"),
  "pagination source must expose deterministic page-window generation.",
);
assert(
  paginationSource.includes('aria-current={current ? "page" : undefined}'),
  "pagination source must expose current-page semantics.",
);
assert(
  paginationSource.includes("hrefForPage"),
  "pagination source must support link mode.",
);
assert(
  paginationSource.includes("hasNextPage"),
  "pagination source must support unbounded mode.",
);
assert(
  paginationSource.includes("motion-reduce:transition-none"),
  "pagination source must respect reduced motion for transitions.",
);
assert(
  boxSource.includes('"data-slot": "box"'),
  "box source must expose stable slot data.",
);
assert(
  boxSource.includes("asChild"),
  "box source must expose child composition.",
);
assert(
  boxSource.includes("boxClassNames"),
  "box source must expose class-name composition.",
);
assert(
  boxSource.includes("ps-[var(--dt-space-4)]"),
  "box source must use tokenized logical start spacing utilities.",
);
assert(
  boxSource.includes("me-[var(--dt-space-4)]"),
  "box source must use tokenized logical end margin utilities.",
);
assert(
  boxSource.includes("bg-primary"),
  "box source must use tokenized primary surface utilities.",
);
assert(
  boxSource.includes("border-input"),
  "box source must use tokenized input border utilities.",
);
assert(
  boxSource.includes("rounded-md"),
  "box source must use tokenized radius utilities.",
);
assert(
  boxSource.includes("overflow-clip"),
  "box source must expose overflow clip utilities.",
);
assert(
  !boxSource.includes("@radix-ui"),
  "box source must remain dependency-free.",
);
assert(
  buttonSource.includes("leftIcon"),
  "button source must expose leftIcon.",
);
assert(
  buttonSource.includes("rightIcon"),
  "button source must expose rightIcon.",
);
assert(buttonSource.includes("asChild"), "button source must expose asChild.");
assert(
  buttonSource.includes('dataSlot = "button"'),
  "button source must expose stable slot data.",
);
assert(
  buttonSource.includes("bg-primary"),
  "button source must use tokenized primary utilities.",
);
assert(
  !buttonSource.includes("@radix-ui"),
  "button source must remain dependency-free.",
);
assert(
  buttonGroupSource.includes('role="group"') &&
    buttonGroupSource.includes('dataSlot = "button-group"') &&
    buttonGroupSource.includes('data-slot="button-group-separator"') &&
    buttonGroupSource.includes("data-mode") &&
    buttonGroupSource.includes("data-orientation"),
  "button-group source must expose semantic group and stable state anatomy.",
);
assert(
  buttonGroupSource.includes("rounded-s-md") &&
    buttonGroupSource.includes("rounded-e-md") &&
    buttonGroupSource.includes("-ms-px") &&
    buttonGroupSource.includes("gap-density-gap") &&
    buttonGroupSource.includes("bg-border"),
  "button-group source must use logical token-backed attached and separated geometry.",
);
assert(
  !buttonGroupSource.includes('from "motion') &&
    !buttonGroupSource.includes("AnimatePresence") &&
    !buttonGroupSource.includes("DropdownMenu") &&
    !buttonGroupSource.includes("transition-") &&
    !buttonGroupSource.includes("animate-"),
  "button-group source must not import Motion or DropdownMenu or add intrinsic animation.",
);
assert(
  !buttonGroupSource.includes("createContext") &&
    !buttonGroupSource.includes("useContext"),
  "button-group source must remain context-free and usable from Server Components.",
);
assert(
  responsiveActionRecipeSource.includes('className="@container') &&
    responsiveActionRecipeSource.includes("@min-3xl:flex") &&
    responsiveActionRecipeSource.includes("@min-3xl:hidden") &&
    responsiveActionRecipeSource.includes("headerActions") &&
    responsiveActionRecipeSource.includes("alwaysVisibleIds") &&
    responsiveActionRecipeSource.includes("data-action-id") &&
    responsiveActionRecipeSource.includes("DropdownButton"),
  "responsive action recipe must use one declared action model and an explicit container threshold.",
);
assert(
  !responsiveActionRecipeSource.includes("ResizeObserver") &&
    !responsiveActionRecipeSource.includes("getBoundingClientRect") &&
    !responsiveActionRecipeSource.includes("offsetWidth") &&
    !responsiveActionRecipeSource.includes("scrollWidth") &&
    !responsiveActionRecipeSource.includes("createContext") &&
    !responsiveActionRecipeSource.includes("roving"),
  "responsive action recipe must not measure, rank, hide children imperatively, or add group-owned focus semantics.",
);
assert(
  packageIndexSource.includes("ButtonGroup") &&
    packageIndexSource.includes("ButtonGroupSeparator") &&
    packageIndexSource.includes("ButtonGroupProps"),
  "root package index must export the ButtonGroup family and public types.",
);
assert(
  dropdownButtonSource.includes('data-slot="dropdown-button"') &&
    dropdownButtonSource.includes("data-mode={mode}") &&
    dropdownButtonSource.includes(
      'data-state={effectiveOpen ? "open" : "closed"}',
    ) &&
    dropdownButtonSource.includes("ButtonGroup") &&
    dropdownButtonSource.includes("DropdownMenu") &&
    dropdownButtonSource.includes("DropdownMenuContent") &&
    dropdownButtonSource.includes("DropdownMenuTrigger"),
  "dropdown-button source must expose menu state and compose the existing action primitives.",
);
assert(
  dropdownButtonSource.includes("onPrimaryAction?: never") &&
    dropdownButtonSource.includes('mode?: "menu"') &&
    dropdownButtonSource.includes('mode: "split"') &&
    dropdownButtonSource.includes('mode: "selectable"') &&
    dropdownButtonSource.includes("DropdownButtonSelectableAction") &&
    dropdownButtonSource.includes("defaultSelectedActionId") &&
    dropdownButtonSource.includes("selectedActionId") &&
    dropdownButtonSource.includes('selectionMode={isSelectable ? "single"') &&
    dropdownButtonSource.includes("DropdownButtonSelectionIndicator") &&
    dropdownButtonSource.includes('from "lucide-react"') &&
    dropdownButtonSource.includes("menuLabel: string") &&
    dropdownButtonSource.includes('data-slot="dropdown-button-primary"') &&
    dropdownButtonSource.includes('"dropdown-button-menu-trigger"') &&
    dropdownButtonSource.includes(
      "anchorRef={hasPrimary ? compositeRef : undefined}",
    ) &&
    dropdownButtonSource.includes('loadingBehavior = "all"') &&
    dropdownButtonSource.includes("primaryDisabled") &&
    dropdownButtonSource.includes("menuDisabled") &&
    buttonSource.includes("loadingIndicator"),
  "dropdown-button must discriminate menu, split, and selectable modes with stable controls, full-composite anchoring, and Button-backed async policies.",
);
assert(
  dropdownButtonSource.includes('from "motion/react"') &&
    dropdownButtonSource.includes("motion.span") &&
    dropdownButtonSource.includes("ChevronDown") &&
    dropdownButtonSource.includes("AnimatePresence") &&
    dropdownButtonSource.includes("dropdown-button-busy-indicator") &&
    dropdownButtonSource.includes("motionDisabled={") &&
    dropdownButtonSource.includes(
      'resolvedReducedMotion || motionPreset === "none"',
    ) &&
    dropdownButtonSource.includes("useReducedMotion") &&
    !dropdownButtonSource.includes("transition-") &&
    !dropdownButtonSource.includes("animate-"),
  "dropdown-button must use a Lucide chevron with Motion-only feedback and no CSS animation utilities.",
);
assert(
  packageIndexSource.includes("DropdownButton") &&
    packageIndexSource.includes("DropdownButtonSelectableAction") &&
    packageIndexSource.includes("DropdownButtonSelectableProps") &&
    packageIndexSource.includes("DropdownButtonProps") &&
    packageIndexSource.includes("DropdownButtonMotionPreset") &&
    packageIndexSource.includes("DropdownButtonLoadingBehavior"),
  "root package index must export DropdownButton and its public types.",
);
assert(
  revealButtonSource.includes('data-slot="reveal-button"'),
  "reveal-button source must expose stable root slot data.",
);
assert(
  revealButtonSource.includes("whileHover"),
  "reveal-button source must use Motion hover gestures.",
);
assert(
  revealButtonSource.includes("whileFocus"),
  "reveal-button source must use Motion focus gestures.",
);
assert(
  revealButtonSource.includes("whileTap"),
  "reveal-button source must use Motion press feedback.",
);
assert(
  revealButtonSource.includes("useReducedMotion"),
  "reveal-button source must respect reduced-motion preferences.",
);
assert(
  packageIndexSource.includes("RevealButton"),
  "package index must export RevealButton.",
);
assert(
  soundInputSource.includes('data-slot="sound-input"'),
  "sound-input source must expose stable root slot data.",
);
assert(
  soundInputSource.includes('data-slot="sound-input-waveform"'),
  "sound-input source must expose stable waveform slot data.",
);
assert(
  soundInputSource.includes("navigator.mediaDevices.getUserMedia"),
  "sound-input source must document unsupported getUserMedia handling.",
);
assert(
  soundInputSource.includes("mediaDevices.getUserMedia"),
  "sound-input source must request media from the click path.",
);
assert(
  soundInputSource.includes("stopMediaStream"),
  "sound-input source must centralize owned stream cleanup.",
);
assert(
  soundInputSource.includes("useReducedMotion"),
  "sound-input source must respect reduced-motion preferences.",
);
assert(
  soundInputSource.includes("useMotionValue"),
  "sound-input source must use Motion values for waveform state.",
);
assert(
  soundInputSource.includes("motionElement.button"),
  "sound-input source must render a Motion button primitive.",
);
assert(
  packageIndexSource.includes("SoundInput"),
  "package index must export SoundInput.",
);
assert(
  cardSource.includes('"data-slot": "card"'),
  "card source must expose stable root slot data.",
);
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
assert(
  cardSource.includes("asChild"),
  "card source must expose child composition.",
);
assert(
  cardSource.includes("cardClassNames"),
  "card source must expose class-name composition.",
);
assert(
  cardSource.includes("CardFooterJustify"),
  "card source must expose footer justification typing.",
);
assert(
  cardSource.includes("bg-background"),
  "card source must use tokenized background utilities.",
);
assert(
  cardSource.includes("bg-muted"),
  "card source must use tokenized muted utilities.",
);
assert(
  cardSource.includes("border-border"),
  "card source must use tokenized border utilities.",
);
assert(
  cardSource.includes("rounded-lg"),
  "card source must use tokenized radius utilities.",
);
assert(
  cardSource.includes("shadow-sm"),
  "card source must expose shadow utilities.",
);
assert(
  cardSource.includes("--card-padding"),
  "card source must expose density-backed card padding.",
);
assert(
  cardSource.includes("--card-gap"),
  "card source must expose density-backed card gap.",
);
assert(
  cardSource.includes("ms-[var(--dt-space-4)]"),
  "card source must use tokenized logical action spacing.",
);
assert(
  cardSource.includes("justify-between"),
  "card source must expose footer distribution utilities.",
);
assert(
  !cardSource.includes("@radix-ui"),
  "card source must remain dependency-free.",
);
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
assert(
  cardStackSource.includes("inert"),
  "card-stack source must make inactive cards inert.",
);
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
assert(
  !cardStackSource.includes("framer-motion"),
  "card-stack source must not use Motion.",
);
assert(
  !cardStackSource.includes("@radix-ui"),
  "card-stack source must remain Radix-free.",
);
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
  checkboxSource.includes(
    'aria-checked={checkedState === "indeterminate" ? "mixed" : undefined}',
  ),
  "checkbox source must expose mixed state to assistive tech.",
);
assert(
  checkboxSource.includes("onCheckedChange"),
  "checkbox source must expose checked change callbacks.",
);
assert(
  checkboxSource.includes('type="checkbox"'),
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
assert(
  !checkboxSource.includes("@radix-ui"),
  "checkbox source must remain Radix-free.",
);
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
  comboboxSource.includes('portalSlot: "combobox-portal-container"'),
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
  comboboxSource.includes("DethinkPortalProvider") &&
    comboboxSource.includes("useProviderPortalRoot"),
  "combobox source must render client popovers through the provider-aware portal helper.",
);
assert(
  !comboboxSource.includes("UNSTABLE_portalContainer"),
  "combobox source must not use React Aria's deprecated UNSTABLE_portalContainer prop.",
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
  comboboxSource.includes(
    "type ComboboxComponent = (<T extends ComboboxItemData",
  ),
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
assert(
  !comboboxSource.includes("@radix-ui"),
  "combobox source must remain Radix-free.",
);
assert(
  commandPaletteSource.includes('from "motion/react"') &&
    commandPaletteSource.includes("MotionConfig") &&
    commandPaletteSource.includes("AnimatePresence") &&
    commandPaletteSource.includes("useReducedMotion"),
  "command-palette source must use Motion primitives and reduced-motion detection.",
);
assert(
  commandPaletteSource.includes('data-slot="command-palette"') &&
    commandPaletteSource.includes('data-slot="command-palette-input"') &&
    commandPaletteSource.includes('data-slot="command-palette-list"') &&
    commandPaletteSource.includes('data-slot="command-palette-group"') &&
    commandPaletteSource.includes('"data-slot": "command-palette-item"') &&
    commandPaletteSource.includes('data-slot="command-palette-page-stack"') &&
    commandPaletteSource.includes('data-slot="command-palette-page"') &&
    commandPaletteSource.includes('data-slot="command-palette-page-back"') &&
    commandPaletteSource.includes('data-slot="command-palette-announcer"'),
  "command-palette source must expose stable command anatomy slots.",
);
assert(
  commandPaletteSource.includes(
    '"data-slot": "command-palette-motion-result"',
  ) &&
    commandPaletteSource.includes(
      '"data-slot": "command-palette-selected-indicator"',
    ) &&
    commandPaletteSource.includes("data-motion-stagger") &&
    commandPaletteSource.includes("data-reduced-motion"),
  "command-palette source must expose result, selection, and reduced-motion hooks.",
);
assert(
  commandPaletteSource.includes("defaultCommandPaletteFilter") &&
    commandPaletteSource.includes("getCommandPaletteFilteredCommands") &&
    commandPaletteSource.includes("getCommandPaletteSourceCommands"),
  "command-palette source must export filtering and source-composition helpers.",
);
assert(
  commandPaletteSource.includes("type CommandPaletteCommandType =") &&
    commandPaletteSource.includes("type CommandPaletteMotionPreset =") &&
    commandPaletteSource.includes("interface CommandPalettePageDefinition") &&
    commandPaletteSource.includes(
      "interface CommandPalettePageStackChangeContext",
    ),
  "command-palette source must publish typed commands, motion presets, and nested page contracts.",
);
assert(
  commandPaletteSource.includes("bg-background") &&
    commandPaletteSource.includes("border-border") &&
    commandPaletteSource.includes("focus-visible:ring-ring") &&
    commandPaletteSource.includes("text-destructive") &&
    commandPaletteSource.includes("h-density-control"),
  "command-palette source must use provider tokens for surface, focus, danger, and density states.",
);
assert(
  commandPaletteIndexSource.includes("CommandPalettePageStack") &&
    commandPaletteIndexSource.includes("commandPalettePageStackClassNames") &&
    commandPaletteIndexSource.includes("CommandPaletteMotionPreset") &&
    commandPaletteIndexSource.includes("CommandPalettePageStackProps"),
  "command-palette package index must export page-stack components, helpers, and types.",
);
assert(
  packageIndexSource.includes("CommandPalettePageStack") &&
    packageIndexSource.includes("commandPalettePageStackClassNames") &&
    packageIndexSource.includes("CommandPaletteMotionPreset") &&
    packageIndexSource.includes("CommandPalettePageStackProps"),
  "root package index must export command-palette page-stack APIs.",
);
assert(
  !commandPaletteSource.includes("@radix-ui"),
  "command-palette source must remain Radix-free.",
);
assert(
  !commandPaletteSource.includes("cmdk"),
  "command-palette source must not wrap cmdk.",
);
assert(
  multiSelectSource.includes("react-aria-components"),
  "multi-select source must use React Aria Components.",
);
assert(
  multiSelectSource.includes('data-slot={dataSlot ?? "multi-select"}'),
  "multi-select source must expose stable root slot data.",
);
assert(
  multiSelectSource.includes('data-slot="multi-select-control"') &&
    multiSelectSource.includes('data-slot="multi-select-chip"') &&
    multiSelectSource.includes('data-slot="multi-select-popover"') &&
    multiSelectSource.includes('data-slot="multi-select-listbox"'),
  "multi-select source must expose stable control, chip, popover, and listbox slots.",
);
assert(
  multiSelectSource.includes('portalSlot: "multi-select-portal-container"'),
  "multi-select source must expose stable provider-aware portal host slot data.",
);
assert(
  multiSelectSource.includes("selectedItems"),
  "multi-select source must preserve selected labels for async result windows.",
);
assert(
  multiSelectSource.includes('type="hidden"'),
  "multi-select source must serialize repeated native form values.",
);
assert(
  !multiSelectSource.includes("@radix-ui"),
  "multi-select source must remain Radix-free.",
);
assert(
  asyncSelectSource.includes('data-slot={dataSlot ?? "async-select"}'),
  "async-select source must expose stable root slot data.",
);
assert(
  asyncSelectSource.includes("selectionMode") &&
    asyncSelectSource.includes("<Combobox") &&
    asyncSelectSource.includes("<MultiSelect"),
  "async-select source must support single and multiple selection rendering.",
);
assert(
  asyncSelectSource.includes('role="status"') &&
    asyncSelectSource.includes('role="alert"') &&
    asyncSelectSource.includes("onRetry"),
  "async-select source must expose loading/status/error retry states.",
);
assert(
  !asyncSelectSource.includes("@radix-ui"),
  "async-select source must remain Radix-free.",
);
assert(
  tagInputSource.includes("TagGroup") &&
    tagInputSource.includes("TagList") &&
    tagInputSource.includes("AriaTag"),
  "tag-input source must use React Aria tag semantics.",
);
assert(
  tagInputSource.includes('data-slot={dataSlot ?? "tag-input"}') &&
    tagInputSource.includes('data-slot="tag-input-control"') &&
    tagInputSource.includes('data-slot="tag-input-tag"') &&
    tagInputSource.includes('data-slot="tag-input-field"'),
  "tag-input source must expose stable root, control, tag, and field slots.",
);
assert(
  tagInputSource.includes("onPaste") &&
    tagInputSource.includes("validateTag") &&
    tagInputSource.includes('type="hidden"'),
  "tag-input source must support paste parsing, validation, and form serialization.",
);
assert(
  !tagInputSource.includes("@radix-ui"),
  "tag-input source must remain Radix-free.",
);
assert(
  containerSource.includes('"data-slot": "container"'),
  "container source must expose stable slot data.",
);
assert(
  containerSource.includes("asChild"),
  "container source must expose child composition.",
);
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
assert(
  containerSource.includes("mx-auto"),
  "container source must default to centered layout.",
);
assert(
  containerSource.includes("me-auto"),
  "container source must support logical start alignment.",
);
assert(
  containerSource.includes("ms-auto"),
  "container source must support logical end alignment.",
);
assert(
  !containerSource.includes("@radix-ui"),
  "container source must remain dependency-free.",
);
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
assert(
  !formFieldSource.includes("@radix-ui"),
  "form-field source must remain Radix-free.",
);
assert(
  iconButtonSource.includes("IconButtonAccessibleName"),
  "icon-button source must expose accessible-name typing.",
);
assert(
  iconButtonSource.includes('data-slot="icon-button"'),
  "icon-button source must expose stable root slot data.",
);
assert(
  iconButtonSource.includes('data-slot="icon-button-icon"'),
  "icon-button source must expose stable icon slot data.",
);
assert(
  iconButtonSource.includes("aria-busy"),
  "icon-button source must expose loading busy state.",
);
assert(
  iconButtonSource.includes("bg-primary"),
  "icon-button source must use tokenized primary utilities.",
);
assert(
  !iconButtonSource.includes("@radix-ui"),
  "icon-button source must remain dependency-free.",
);
assert(
  flexSource.includes('"data-slot": "flex"'),
  "flex source must expose stable root slot data.",
);
assert(
  flexSource.includes('"data-slot": "flex-item"'),
  "flex source must expose stable item slot data.",
);
assert(
  flexSource.includes("asChild"),
  "flex source must expose child composition.",
);
assert(
  flexSource.includes("flexClassNames"),
  "flex source must expose class-name composition.",
);
assert(
  flexSource.includes("flexItemClassNames"),
  "flex source must expose item class-name composition.",
);
assert(
  flexSource.includes("inline-flex"),
  "flex source must expose inline-flex utilities.",
);
assert(
  flexSource.includes("flex-row"),
  "flex source must expose row direction utilities.",
);
assert(
  flexSource.includes("flex-col"),
  "flex source must expose column direction utilities.",
);
assert(
  flexSource.includes("flex-wrap"),
  "flex source must expose wrapping utilities.",
);
assert(
  flexSource.includes("gap-y-[var(--dt-space-2)]"),
  "flex source must expose tokenized row gap utilities.",
);
assert(
  flexSource.includes("gap-x-[var(--dt-space-6)]"),
  "flex source must expose tokenized column gap utilities.",
);
assert(
  flexSource.includes("items-center"),
  "flex source must expose alignment utilities.",
);
assert(
  flexSource.includes("justify-evenly"),
  "flex source must expose distribution utilities.",
);
assert(
  flexSource.includes("content-between"),
  "flex source must expose align-content utilities.",
);
assert(
  flexSource.includes("grow-0"),
  "flex source must expose grow utilities.",
);
assert(
  flexSource.includes("shrink-0"),
  "flex source must expose shrink utilities.",
);
assert(
  flexSource.includes("basis-64"),
  "flex source must expose basis utilities.",
);
assert(
  flexSource.includes("min-w-0"),
  "flex source must expose long-content shrink utilities.",
);
assert(
  !flexSource.includes("reverse"),
  "flex source must not expose visual reverse ordering.",
);
assert(
  !flexSource.includes("@radix-ui"),
  "flex source must remain dependency-free.",
);
assert(
  gridSource.includes('"data-slot": "grid"'),
  "grid source must expose stable root slot data.",
);
assert(
  gridSource.includes('"data-slot": "grid-item"'),
  "grid source must expose stable item slot data.",
);
assert(
  gridSource.includes("asChild"),
  "grid source must expose child composition.",
);
assert(
  gridSource.includes("gridClassNames"),
  "grid source must expose class-name composition.",
);
assert(
  gridSource.includes("gridItemClassNames"),
  "grid source must expose item class-name composition.",
);
assert(
  gridSource.includes("grid-cols-12"),
  "grid source must expose fixed grid columns.",
);
assert(
  gridSource.includes("repeat(auto-fit,minmax(min(16rem,100%),1fr))"),
  "grid source must expose static auto-fit grid columns.",
);
assert(
  gridSource.includes("grid-rows-3"),
  "grid source must expose row utilities.",
);
assert(
  gridSource.includes("gap-y-[var(--dt-space-2)]"),
  "grid source must expose tokenized row gap utilities.",
);
assert(
  gridSource.includes("gap-x-[var(--dt-space-6)]"),
  "grid source must expose tokenized column gap utilities.",
);
assert(
  gridSource.includes("items-center"),
  "grid source must expose item alignment utilities.",
);
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
assert(
  gridSource.includes("col-span-full"),
  "grid source must expose column span utilities.",
);
assert(
  gridSource.includes("row-span-full"),
  "grid source must expose row span utilities.",
);
assert(
  gridSource.includes("justify-self-end"),
  "grid source must expose item self justification utilities.",
);
assert(
  gridSource.includes("min-w-0"),
  "grid source must expose long-content shrink utilities.",
);
assert(
  !gridSource.includes("dense"),
  "grid source must not expose dense visual packing.",
);
assert(
  !gridSource.includes("@radix-ui"),
  "grid source must remain dependency-free.",
);
assert(
  linkSource.includes('data-slot="link"'),
  "link source must expose stable slot data.",
);
assert(
  linkSource.includes("aria-current"),
  "link source must preserve aria-current state.",
);
assert(
  linkSource.includes("noopener"),
  "link source must add new-tab noopener safety.",
);
assert(
  linkSource.includes("asChild"),
  "link source must expose router composition.",
);
assert(
  linkSource.includes("text-primary"),
  "link source must use tokenized primary utilities.",
);
assert(
  !linkSource.includes("@radix-ui"),
  "link source must remain dependency-free.",
);
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
  radioGroupSource.includes("role={resolvedRole}"),
  "radio-group source must expose radiogroup semantics for labelled standalone groups.",
);
assert(
  radioGroupSource.includes('type="radio"'),
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
assert(
  !radioGroupSource.includes("@radix-ui"),
  "radio-group source must remain Radix-free.",
);
assert(
  separatorSource.includes('"data-slot": "separator"'),
  "separator source must expose stable slot data.",
);
assert(
  separatorSource.includes("Divider"),
  "separator source must expose Divider alias.",
);
assert(
  separatorSource.includes("asChild"),
  "separator source must expose child composition.",
);
assert(
  separatorSource.includes("separatorClassNames"),
  "separator source must expose class-name composition.",
);
assert(
  separatorSource.includes("aria-hidden"),
  "separator source must expose decorative mode.",
);
assert(
  separatorSource.includes("aria-orientation"),
  "separator source must expose orientation semantics.",
);
assert(
  separatorSource.includes(
    'role: asChild || as !== "hr" ? "separator" : undefined',
  ),
  "separator source must preserve native hr semantics.",
);
assert(
  separatorSource.includes("h-px"),
  "separator source must expose horizontal thickness utilities.",
);
assert(
  separatorSource.includes("w-px"),
  "separator source must expose vertical thickness utilities.",
);
assert(
  separatorSource.includes("bg-border"),
  "separator source must use tokenized border color utilities.",
);
assert(
  separatorSource.includes("bg-muted-foreground/25"),
  "separator source must expose muted tone utilities.",
);
assert(
  separatorSource.includes("bg-foreground/40"),
  "separator source must expose strong tone utilities.",
);
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
assert(
  !separatorSource.includes("@radix-ui"),
  "separator source must remain dependency-free.",
);
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
  selectSource.includes('portalSlot: "select-portal-container"'),
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
  selectSource.includes("DethinkPortalProvider") &&
    selectSource.includes("useProviderPortalRoot"),
  "select source must render client popovers through the provider-aware portal helper.",
);
assert(
  !selectSource.includes("UNSTABLE_portalContainer"),
  "select source must not use React Aria's deprecated UNSTABLE_portalContainer prop.",
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
assert(
  !selectSource.includes("@radix-ui"),
  "select source must remain Radix-free.",
);
assert(
  stackSource.includes('"data-slot": "stack"'),
  "stack source must expose stable slot data.",
);
assert(
  stackSource.includes("asChild"),
  "stack source must expose child composition.",
);
assert(
  stackSource.includes("stackClassNames"),
  "stack source must expose class-name composition.",
);
assert(
  stackSource.includes("flex-col"),
  "stack source must expose vertical direction utilities.",
);
assert(
  stackSource.includes("flex-row"),
  "stack source must expose horizontal direction utilities.",
);
assert(
  stackSource.includes("gap-[var(--dt-space-4)]"),
  "stack source must expose tokenized gap utilities.",
);
assert(
  stackSource.includes("items-center"),
  "stack source must expose alignment utilities.",
);
assert(
  stackSource.includes("justify-between"),
  "stack source must expose justification utilities.",
);
assert(
  stackSource.includes("flex-wrap"),
  "stack source must expose wrapping utilities.",
);
assert(
  !stackSource.includes("reverse"),
  "stack source must not expose visual reverse ordering.",
);
assert(
  !stackSource.includes("@radix-ui"),
  "stack source must remain dependency-free.",
);
assert(
  stepsSource.includes('data-slot="steps"'),
  "steps source must expose a stable root slot.",
);
assert(
  stepsSource.includes('role="list"'),
  "steps source must preserve ordered-list semantics with a Safari-safe list role.",
);
assert(
  stepsSource.includes('aria-current={current ? "step" : undefined}'),
  "steps source must expose current-step semantics independently from status.",
);
assert(
  stepsSource.includes('role="progressbar"'),
  "steps source must expose progressbar semantics.",
);
assert(
  stepsSource.includes("AnimatePresence"),
  "steps source must animate keyed branch insertion and removal.",
);
assert(
  stepsSource.includes('layout={motionEnabled ? "position" : false}'),
  "steps source must animate surviving item positions without resizing content.",
);
assert(
  stepsSource.includes("useReducedMotion"),
  "steps source must respect reduced-motion preferences.",
);
assert(
  stepsSource.includes("currentMarkerLayoutId"),
  "steps source must namespace its shared current marker.",
);
assert(
  stepsSource.includes("scaleX"),
  "steps source must update progress with a transform.",
);
assert(
  packageIndexSource.includes("StepsMotionPreset"),
  "package index must export Steps and its public motion preset type.",
);
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
  switchSource.includes('type="checkbox"'),
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
assert(
  !switchSource.includes("@radix-ui"),
  "switch source must remain Radix-free.",
);
assert(
  tableSource.includes('data-slot="table-container"'),
  "table source must expose stable responsive wrapper slot data.",
);
assert(
  tableSource.includes('data-slot="table"'),
  "table source must expose stable native table slot data.",
);
assert(
  tableSource.includes('data-slot="table-header"'),
  "table source must expose stable header slot data.",
);
assert(
  tableSource.includes('data-slot="table-body"'),
  "table source must expose stable body slot data.",
);
assert(
  tableSource.includes('data-slot="table-footer"'),
  "table source must expose stable footer slot data.",
);
assert(
  tableSource.includes('data-slot="table-row"'),
  "table source must expose stable row slot data.",
);
assert(
  tableSource.includes('data-slot="table-head"'),
  "table source must expose stable header cell slot data.",
);
assert(
  tableSource.includes('data-slot="table-cell"'),
  "table source must expose stable data cell slot data.",
);
assert(
  tableSource.includes('data-slot="table-caption"'),
  "table source must expose stable caption slot data.",
);
assert(
  tableSource.includes("TableDensity"),
  "table source must expose density typing.",
);
assert(
  tableSource.includes("TableCaptionPlacement"),
  "table source must expose caption placement typing.",
);
assert(
  tableSource.includes("TableCellAlign"),
  "table source must expose logical cell alignment typing.",
);
assert(
  tableSource.includes("TableRowTone"),
  "table source must expose row tone typing.",
);
assert(
  tableSource.includes("tableContainerClassNames"),
  "table source must expose container class-name composition.",
);
assert(
  tableSource.includes("tableCellClassNames"),
  "table source must expose cell class-name composition.",
);
assert(
  tableSource.includes("overflow-x-auto"),
  "table source must wrap native tables with responsive horizontal overflow.",
);
assert(
  tableSource.includes('scope = "col"'),
  "table source must default header cells to column scope.",
);
assert(
  tableSource.includes("--table-cell-px") &&
    tableSource.includes("--table-cell-py"),
  "table source must use density-backed cell spacing variables.",
);
assert(
  tableSource.includes("h-[var(--table-row-min-height)]"),
  "table source must apply density-backed row height to table cells.",
);
assert(
  tableSource.includes("[data-slot=checkbox-input]") &&
    tableSource.includes("input[type=checkbox]") &&
    !tableSource.includes("[role=checkbox]"),
  "table source must target real checkbox markup for compact selection cell padding.",
);
assert(
  tableSource.includes("border-border"),
  "table source must use tokenized borders.",
);
assert(
  tableSource.includes("bg-muted"),
  "table source must use tokenized muted row states.",
);
assert(
  tableSource.includes("motion-safe:transition-colors") &&
    tableSource.includes("motion-safe:duration-150") &&
    tableSource.includes("motion-safe:ease-out") &&
    tableSource.includes("motion-reduce:transition-none"),
  "table source must animate row hover color with a reduced-motion fallback.",
);
assert(
  tableSource.includes("text-muted-foreground"),
  "table source must use tokenized caption and header text.",
);
assert(
  tableSource.includes("tabular-nums"),
  "table source must expose numeric cell styling.",
);
assert(
  tableSource.includes("text-end"),
  "table source must expose logical end alignment.",
);
assert(
  tableSource.includes("caption-top") && tableSource.includes("caption-bottom"),
  "table source must expose caption placement utilities.",
);
assert(
  !tableSource.includes("@radix-ui"),
  "table source must remain Radix-free.",
);
assert(
  !tableSource.includes("react-aria"),
  "table source must remain dependency-free and avoid grid-style React Aria behavior.",
);
assert(
  tabsSource.includes('from "motion/react"') &&
    tabsSource.includes("MotionConfig") &&
    tabsSource.includes("useReducedMotion"),
  "tabs source must use Motion primitives and reduced-motion detection.",
);
assert(
  tabsSource.includes('data-slot="tabs"') &&
    tabsSource.includes('data-slot="tabs-list"') &&
    tabsSource.includes('data-slot="tabs-trigger"') &&
    tabsSource.includes('data-slot="tabs-panel"') &&
    tabsSource.includes('"data-slot": "tabs-active-layer"'),
  "tabs source must expose stable root, list, trigger, panel, and active-layer slots.",
);
assert(
  tabsSource.includes('role = "tablist"') &&
    tabsSource.includes('role="tab"') &&
    tabsSource.includes('role="tabpanel"') &&
    tabsSource.includes("aria-selected") &&
    tabsSource.includes("aria-controls") &&
    tabsSource.includes("aria-labelledby"),
  "tabs source must implement APG tab semantics.",
);
assert(
  tabsSource.includes("layoutId={layoutId}") &&
    tabsSource.includes("data-reduced-motion") &&
    tabsSource.includes('motionPreset === "none"'),
  "tabs source must implement a shared-layout active layer with reduced-motion fallback.",
);
assert(
  tabsSource.includes('variant="pill"') ||
    (tabsSource.includes('variant = "pill"') && tabsSource.includes('"line"')),
  "tabs source must default to pill tabs and expose the line variant.",
);
assert(
  tabsSource.includes("activationMode") &&
    tabsSource.includes("ArrowRight") &&
    tabsSource.includes("ArrowLeft") &&
    tabsSource.includes("ArrowDown") &&
    tabsSource.includes("ArrowUp") &&
    tabsSource.includes("Home") &&
    tabsSource.includes("End"),
  "tabs source must expose activation mode and APG keyboard navigation.",
);
assert(
  tabsSource.includes("isRootRtl"),
  "tabs source must resolve RTL-aware horizontal arrow behavior.",
);
assert(
  tabsSource.includes("forceMount") &&
    tabsSource.includes("hidden={hiddenProp ?? !selected}"),
  "tabs source must support force-mounted hidden inactive panels.",
);
assert(
  tabsSource.includes("bg-primary") &&
    tabsSource.includes("text-primary-foreground") &&
    tabsSource.includes("border-border") &&
    tabsSource.includes("focus-visible:ring-ring") &&
    tabsSource.includes("min-h-density-control"),
  "tabs source must use provider tokens for active state, borders, focus, and density.",
);
assert(
  packageIndexSource.includes("TabsTrigger") &&
    packageIndexSource.includes("tabsTriggerClassNames") &&
    packageIndexSource.includes("TabsMotionPreset") &&
    packageIndexSource.includes("TabsPanelProps"),
  "root package index must export tabs components, helpers, and types.",
);
assert(
  !tabsSource.includes("@radix-ui"),
  "tabs source must remain Radix-free.",
);
assert(
  !tabsSource.includes("react-aria-components"),
  "tabs source must not depend on React Aria Components for unavailable Tabs APIs.",
);
assert(
  dataTableSource.includes("@tanstack/react-table"),
  "data-table source must use TanStack Table for headless state.",
);
assert(
  dataTableSource.includes('data-slot="data-table"'),
  "data-table source must expose stable root slot data.",
);
assert(
  dataTableSource.includes('data-slot="data-table-toolbar"'),
  "data-table source must expose toolbar slot data.",
);
assert(
  dataTableSource.includes('data-slot="data-table-global-filter"'),
  "data-table source must expose global filter slot data.",
);
assert(
  dataTableSource.includes('data-slot="data-table-column-visibility"'),
  "data-table source must expose column visibility slot data.",
);
assert(
  dataTableSource.includes('data-slot="data-table-pagination"'),
  "data-table source must expose pagination slot data.",
);
assert(
  dataTableSource.includes('data-slot="data-table-sort-button"'),
  "data-table source must expose sort button slot data.",
);
assert(
  dataTableSource.includes('data-slot="data-table-sort-icon"'),
  "data-table source must expose icon-based sort state.",
);
assert(
  dataTableSource.includes('data-slot="data-table-header-content"') &&
    dataTableSource.includes('data-slot="data-table-column-filter"'),
  "data-table source must separate header labels from column filter controls.",
);
assert(
  dataTableSource.includes('data-table-slot="selection-cell"'),
  "data-table source must expose selection cell slot data.",
);
assert(
  dataTableSource.includes('data-table-slot="row-actions"'),
  "data-table source must expose row action slot data.",
);
assert(
  dataTableSource.includes("aria-sort={getAriaSort(sorted)}"),
  "data-table source must expose aria-sort on sorted header cells.",
);
assert(
  dataTableSource.includes("manualFiltering") &&
    dataTableSource.includes("manualPagination") &&
    dataTableSource.includes("manualSorting"),
  "data-table source must expose manual server-mode flags.",
);
assert(
  dataTableSource.includes("getFilteredRowModel") &&
    dataTableSource.includes("getPaginationRowModel") &&
    dataTableSource.includes("getSortedRowModel"),
  "data-table source must wire local row models for filtering, pagination, and sorting.",
);
assert(
  dataTableSource.includes("Checkbox") &&
    dataTableSource.includes("Input") &&
    dataTableSource.includes("Button"),
  "data-table source must compose existing controls.",
);
assert(
  dataTableSource.includes('role="status"') &&
    dataTableSource.includes('role="alert"'),
  "data-table source must expose accessible loading and error states.",
);
assert(
  !dataTableSource.includes('role="grid"'),
  "data-table source must not add grid roles.",
);
assert(
  !dataTableSource.includes("@radix-ui"),
  "data-table source must remain Radix-free.",
);
assert(
  calendarSource.includes("react-aria-components"),
  "calendar source must use React Aria Components.",
);
assert(
  calendarSource.includes('data-slot="calendar"') &&
    calendarSource.includes('data-slot="range-calendar"'),
  "calendar source must expose stable calendar and range-calendar slots.",
);
assert(
  calendarSource.includes("data-slot={`${dataSlotPrefix}-cell`}"),
  "calendar source must expose stable date cell slots.",
);
assert(
  calendarSource.includes("rangeCalendarCellClassNames") &&
    calendarSource.includes("calendarCellClassNames"),
  "calendar source must expose class-name helpers.",
);
assert(
  !calendarSource.includes("@radix-ui"),
  "calendar source must not use Radix.",
);
assert(
  datePickerSource.includes("react-aria-components"),
  "date-picker source must use React Aria Components.",
);
assert(
  datePickerSource.includes('data-slot="date-picker"') &&
    datePickerSource.includes('data-slot="date-picker-field"') &&
    datePickerSource.includes('data-slot="date-picker-calendar"'),
  "date-picker source must expose stable root, field, and calendar slots.",
);
assert(
  datePickerSource.includes("serializeDatePickerValue") &&
    datePickerSource.includes('data-slot="date-picker-form-value"'),
  "date-picker source must expose form serialization.",
);
assert(
  datePickerSource.includes("DethinkPortalProvider") &&
    datePickerSource.includes("useProviderPortalRoot") &&
    datePickerSource.includes('portalSlot: "date-picker-portal-container"'),
  "date-picker source must render popovers through the provider-aware portal helper.",
);
assert(
  !datePickerSource.includes("@radix-ui"),
  "date-picker source must not use Radix.",
);
assert(
  dateRangePickerSource.includes("react-aria-components"),
  "date-range-picker source must use React Aria Components.",
);
assert(
  dateRangePickerSource.includes('data-slot="date-range-picker"') &&
    dateRangePickerSource.includes('data-slot="date-range-picker-field"') &&
    dateRangePickerSource.includes('data-slot="date-range-picker-calendar"'),
  "date-range-picker source must expose stable root, field, and calendar slots.",
);
assert(
  dateRangePickerSource.includes("getDateRangePickerFieldNames") &&
    dateRangePickerSource.includes(
      'data-slot="date-range-picker-start-form-value"',
    ) &&
    dateRangePickerSource.includes(
      'data-slot="date-range-picker-end-form-value"',
    ),
  "date-range-picker source must expose start/end form serialization.",
);
assert(
  dateRangePickerSource.includes("DethinkPortalProvider") &&
    dateRangePickerSource.includes("useProviderPortalRoot") &&
    dateRangePickerSource.includes(
      'portalSlot: "date-range-picker-portal-container"',
    ),
  "date-range-picker source must render popovers through the provider-aware portal helper.",
);
assert(
  !dateRangePickerSource.includes("@radix-ui"),
  "date-range-picker source must not use Radix.",
);
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
assert(
  typographySource.includes("text-primary"),
  "typography source must use tokenized primary utilities.",
);
assert(
  typographySource.includes("text-start"),
  "typography source must use logical alignment utilities.",
);
assert(
  typographySource.includes("line-clamp-3"),
  "typography source must support line clamp utilities.",
);
assert(
  !typographySource.includes("@radix-ui"),
  "typography source must remain dependency-free.",
);
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
  dateTimePickerSource.includes('data-slot="date-time-picker-time-selector"') &&
    dateTimePickerSource.includes("getDateTimePickerTimeOptionValue"),
  "date-time-picker source must expose selectable time controls.",
);
assert(
  dateTimePickerSource.includes("DethinkPortalProvider") &&
    dateTimePickerSource.includes("useProviderPortalRoot") &&
    dateTimePickerSource.includes(
      'portalSlot: "date-time-picker-portal-container"',
    ),
  "date-time-picker source must render popovers through the provider-aware portal helper.",
);
assert(
  dateTimePickerSource.includes("border-input"),
  "date-time-picker source must use tokenized input border utilities.",
);
assert(
  dateTimePickerSource.includes("focus-visible:ring-2"),
  "date-time-picker source must include visible focus styling.",
);
assert(
  !dateTimePickerSource.includes("@radix-ui"),
  "date-time-picker source must not use Radix.",
);
assert(
  dialogSource.includes("react-aria-components"),
  "dialog source must use React Aria Components.",
);
assert(
  dialogSource.includes('data-slot={dataSlot ?? "dialog"}'),
  "dialog source must expose stable root slot data.",
);
assert(
  dialogSource.includes('data-slot={dataSlot ?? "dialog-trigger"}'),
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
  dialogSource.includes(
    "shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}",
  ),
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
  dialogSource.includes("motion-safe:data-[entering]:animate-dialog-in") &&
    dialogSource.includes("motion-safe:data-[exiting]:animate-dialog-out") &&
    dialogSource.includes("motion-reduce:animate-none"),
  "dialog source must use reduced-motion-aware entrance and exit animations.",
);
assert(
  dialogSource.includes("100dvh") &&
    dialogSource.includes("env(safe-area-inset-top)"),
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
assert(
  !dialogSource.includes("@radix-ui"),
  "dialog source must remain Radix-free.",
);
assert(
  drawerSource.includes("react-aria-components"),
  "drawer source must use React Aria Components.",
);
assert(
  !drawerSource.includes('from "motion/react"'),
  "drawer source must isolate Motion to drawer-motion.tsx, not import it directly.",
);
assert(
  drawerSource.includes('data-slot={dataSlot ?? "drawer"}'),
  "drawer source must expose stable root slot data.",
);
assert(
  drawerSource.includes('data-slot={dataSlot ?? "drawer-trigger"}'),
  "drawer source must expose stable trigger slot data.",
);
assert(
  drawerSource.includes('data-slot="drawer-overlay"'),
  "drawer source must expose stable overlay slot data.",
);
assert(
  drawerSource.includes('data-slot="drawer-content"'),
  "drawer source must expose stable content slot data.",
);
assert(
  drawerSource.includes('data-slot="drawer-panel"'),
  "drawer source must expose stable panel slot data.",
);
assert(
  drawerSource.includes('data-slot="drawer-header"'),
  "drawer source must expose stable header slot data.",
);
assert(
  drawerSource.includes('data-slot="drawer-footer"'),
  "drawer source must expose stable footer slot data.",
);
assert(
  drawerSource.includes('data-slot="drawer-title"'),
  "drawer source must expose stable title slot data.",
);
assert(
  drawerSource.includes('data-slot="drawer-description"'),
  "drawer source must expose stable description slot data.",
);
assert(
  drawerSource.includes('data-slot="drawer-close"'),
  "drawer source must expose stable close slot data.",
);
assert(
  drawerSource.includes('data-slot="drawer-handle"'),
  "drawer source must expose stable handle slot data.",
);
assert(
  drawerSource.includes('portalSlot: "drawer-portal-container"'),
  "drawer source must create an explicit provider-aware portal container.",
);
assert(
  drawerSource.includes("isDismissable={dismissible}"),
  "drawer source must expose outside-dismiss behavior in modal mode.",
);
assert(
  drawerSource.includes("isKeyboardDismissDisabled={keyboardDismissDisabled}"),
  "drawer source must expose keyboard-dismiss control in modal mode.",
);
assert(
  drawerSource.includes(
    "shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}",
  ),
  "drawer source must expose custom outside-interaction close guards in modal mode.",
);
assert(
  drawerSource.includes("triggerElementRef.current?.focus()"),
  "drawer source must restore focus to the trigger on close.",
);
assert(
  drawerSource.includes("direction?: DrawerDirection") ||
    drawerSource.includes("direction: DrawerDirection"),
  "drawer source must expose the direction prop.",
);
assert(
  drawerSource.includes("backgroundScale") &&
    drawerSource.includes("useDrawerBackgroundScale"),
  "drawer source must wire the backgroundScale prop to the background-scale hook.",
);
assert(
  drawerSource.includes("edgeSwipeToOpen") &&
    drawerSource.includes("DrawerEdgeSwipeZone"),
  "drawer source must wire edgeSwipeToOpen to the edge-swipe hit-region.",
);
assert(
  drawerSource.includes("motionPreset") &&
    drawerSource.includes("shouldEnableDrawerMotion"),
  "drawer source must gate Motion-driven behavior through motionPreset.",
);
assert(
  drawerSource.includes("layoutId"),
  "drawer source must expose the layoutId shared-element passthrough.",
);
assert(
  drawerSource.includes("DrawerNestedContext") &&
    drawerSource.includes("registerChildOpen"),
  "drawer source must expose nested-drawer parent-recede bookkeeping.",
);
assert(
  drawerSource.includes("bg-background"),
  "drawer source must use tokenized background utilities.",
);
assert(
  drawerSource.includes("border-border"),
  "drawer source must use tokenized border utilities.",
);
assert(
  drawerSource.includes("motion-safe:transition"),
  "drawer source must use reduced-motion-aware transitions for its CSS-only fallback path.",
);
assert(
  drawerSource.includes("dvh") &&
    drawerSource.includes("env(safe-area-inset-top)"),
  "drawer source must constrain full-size directions with dynamic viewport and safe-area units.",
);
assert(
  !drawerSource.includes("@radix-ui"),
  "drawer source must remain Radix-free.",
);
assert(!drawerSource.includes("vaul"), "drawer source must not wrap vaul.");
assert(
  drawerMotionSource.includes('from "motion/react"') &&
    drawerMotionSource.includes("useDragControls") &&
    drawerMotionSource.includes("useReducedMotion"),
  "drawer-motion source must be the sole Motion-importing module for drag/spring/gesture behavior.",
);
assert(
  drawerMotionSource.includes('data-slot="drawer-edge-swipe-zone"'),
  "drawer-motion source must expose stable edge-swipe-zone slot data.",
);
assert(
  drawerBackgroundScaleSource.includes("DRAWER_BACKGROUND_WRAPPER_ATTRIBUTE") &&
    drawerBackgroundScaleSource.includes("DRAWER_BACKGROUND_SCALE_ATTRIBUTE"),
  "drawer-background-scale source must expose the wrapper and state attribute constants.",
);
assert(
  positionedOverlaySource.includes("positionedOverlayPopoverDefaults") &&
    positionedOverlaySource.includes("positionedOverlayTooltipDefaults") &&
    positionedOverlaySource.includes("positionedOverlayDropdownMenuDefaults"),
  "positioned overlay helper must expose component-specific overlay defaults.",
);
assert(
  positionedOverlaySource.includes(
    "motion-safe:data-[entering]:animate-overlay-in",
  ) && positionedOverlaySource.includes("motion-reduce:animate-none"),
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
    dropdownMenuSource.includes('dataSlot = "dropdown-menu-trigger"') &&
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
    dropdownMenuSource.includes('from "motion/react"') &&
    dropdownMenuSource.includes("AnimatePresence") &&
    dropdownMenuSource.includes("useReducedMotion") &&
    !dropdownMenuSource.includes("motion-safe:transition") &&
    !dropdownMenuSource.includes("animate-overlay"),
  "dropdown-menu source must use provider tokens and Motion-only presence and item feedback.",
);
for (const [name, source] of [
  ["popover", popoverSource],
  ["tooltip", tooltipSource],
  ["dropdown-menu", dropdownMenuSource],
]) {
  assert(
    !source.includes("@radix-ui"),
    `${name} source must remain Radix-free.`,
  );
  assert(
    !source.includes("framer-motion"),
    `${name} source must not use Motion.`,
  );
  assert(
    !source.includes("floating-ui"),
    `${name} source must not use Floating UI.`,
  );
}
assert(
  timelineSource.includes('data-slot="timeline"'),
  "timeline source must expose stable root slot data.",
);
assert(
  timelineSource.includes('data-slot="timeline-viewport"'),
  "timeline source must expose viewport slot data.",
);
assert(
  timelineSource.includes("<ol"),
  "timeline source must render an ordered list.",
);
assert(
  timelineSource.includes("<time"),
  "timeline source must render machine-readable time elements.",
);
assert(
  timelineSource.includes("bg-primary"),
  "timeline source must use tokenized primary utilities.",
);
assert(
  timelineSource.includes("bg-success"),
  "timeline source must use tokenized success utilities.",
);
assert(
  timelineSource.includes("border-timeline-border"),
  "timeline source must use timeline border token utilities.",
);
assert(
  timelineSource.includes("bg-timeline-rail"),
  "timeline source must use timeline rail token utilities.",
);
assert(
  !timelineSource.includes("@radix-ui"),
  "timeline source must remain dependency-free.",
);
assert(
  slotPlannerSource.includes('from "motion/react"') &&
    slotPlannerSource.includes("MotionConfig") &&
    slotPlannerSource.includes("AnimatePresence") &&
    slotPlannerSource.includes("useReducedMotion"),
  "slot-planner source must use Motion primitives and reduced-motion detection.",
);
assert(
  slotPlannerSource.includes('data-slot="slot-planner"') &&
    slotPlannerSource.includes('data-slot="slot-planner-day-rail"') &&
    slotPlannerSource.includes('data-slot="slot-planner-day-tab"') &&
    slotPlannerSource.includes('data-slot="slot-planner-day-panel"') &&
    slotPlannerSource.includes('data-slot="slot-planner-slot-list"') &&
    slotPlannerSource.includes('data-slot="slot-planner-add-slot"') &&
    slotPlannerSource.includes('data-slot="slot-planner-cap-meter"') &&
    slotPlannerSource.includes('data-slot="slot-planner-live-region"'),
  "slot-planner source must expose stable planner anatomy slots.",
);
assert(
  slotPlannerSource.includes('role="tablist"') &&
    slotPlannerSource.includes('role="tab"') &&
    slotPlannerSource.includes('"tabpanel"') &&
    slotPlannerSource.includes('aria-live="polite"') &&
    slotPlannerSource.includes("data-reduced-motion"),
  "slot-planner source must keep day-rail tab semantics, the live region, and reduced-motion hooks.",
);
assert(
  slotPickerSource.includes('data-slot="slot-picker"') &&
    slotPickerSource.includes('data-slot="slot-picker-slot-card"') &&
    slotPickerSource.includes('data-slot="slot-picker-request"') &&
    slotPickerSource.includes('data-slot="slot-picker-provider-time"') &&
    slotPickerSource.includes('data-slot="slot-picker-live-region"') &&
    slotPickerSource.includes("data-viewer-time-zone"),
  "slot-picker source must expose stable book-mode anatomy and viewer-zone hooks.",
);
assert(
  slotPlannerSource.includes("bg-background") &&
    slotPlannerSource.includes("focus-visible:ring-ring") &&
    slotPlannerSource.includes("text-destructive") &&
    slotPlannerSource.includes("text-muted-foreground"),
  "slot-planner source must use provider tokens for surface, focus, danger, and muted states.",
);
assert(
  slotPlannerIndexSource.includes("useSlotPlanner") &&
    slotPlannerIndexSource.includes("validateSlotPlannerSlots") &&
    slotPlannerIndexSource.includes("SlotPlannerRenderers") &&
    slotPlannerIndexSource.includes("SlotPicker"),
  "slot-planner index must export the component family, headless hook, constraints utility, and renderer types.",
);
assert(
  packageIndexSource.includes("SlotPlanner") &&
    packageIndexSource.includes("SlotPicker") &&
    packageIndexSource.includes("useSlotPlanner") &&
    packageIndexSource.includes("defaultSlotPlannerTaxonomy"),
  "root package index must export slot-planner family APIs.",
);
assert(
  !packageIndexSource.includes("slotPlannerSampleSlots"),
  "root package index must not export slot-planner fixtures; they ship through the registry item only.",
);
assert(
  !slotPlannerSource.includes("@radix-ui"),
  "slot-planner source must remain Radix-free.",
);
assert(
  !slotPickerSource.includes("@radix-ui"),
  "slot-picker source must remain Radix-free.",
);

const navigationMenuSource = await readFile(
  join(
    root,
    "packages/components/src/components/navigation-menu/navigation-menu.tsx",
  ),
  "utf8",
);
const navDockSource = await readFile(
  join(root, "packages/components/src/components/navdock/navdock.tsx"),
  "utf8",
);
const sidebarSource = await readFile(
  join(root, "packages/components/src/components/sidebar/sidebar.tsx"),
  "utf8",
);
const sidebarShellSource = await readFile(
  join(
    root,
    "packages/components/src/components/sidebar-shell/sidebar-shell.tsx",
  ),
  "utf8",
);
assert(
  navigationMenuSource.includes('data-slot="navigation-menu"') &&
    navigationMenuSource.includes('data-slot="navigation-menu-list"') &&
    navigationMenuSource.includes('data-slot="navigation-menu-item"') &&
    navigationMenuSource.includes('data-slot="navigation-menu-link"') &&
    navigationMenuSource.includes('data-slot="navigation-menu-trigger"') &&
    navigationMenuSource.includes('data-slot="navigation-menu-content"') &&
    navigationMenuSource.includes('data-slot="navigation-menu-viewport"') &&
    navigationMenuSource.includes('data-slot="navigation-menu-indicator"') &&
    navigationMenuSource.includes('data-slot="navigation-menu-featured-item"'),
  "navigation-menu source must expose stable navigation anatomy slots.",
);
assert(
  navigationMenuSource.includes("aria-current") &&
    navigationMenuSource.includes("aria-expanded") &&
    navigationMenuSource.includes("aria-controls"),
  "navigation-menu source must use link and disclosure semantics.",
);
assert(
  !navigationMenuSource.includes('role="menu"') &&
    !navigationMenuSource.includes('role="menubar"') &&
    !navigationMenuSource.includes('role="menuitem"'),
  "navigation-menu source must not use ARIA menu roles for site navigation.",
);
assert(
  navigationMenuSource.includes("bg-muted") &&
    navigationMenuSource.includes("focus-visible:ring-ring") &&
    navigationMenuSource.includes("motion-reduce:animate-none") &&
    navigationMenuSource.includes("motion-reduce:transition-none"),
  "navigation-menu source must use provider tokens and reduced-motion-aware classes.",
);
assert(
  !navigationMenuSource.includes("@radix-ui"),
  "navigation-menu source must remain Radix-free.",
);
assert(
  !navigationMenuSource.includes("framer-motion") &&
    !navigationMenuSource.includes('from "motion'),
  "navigation-menu source must not use Motion.",
);
assert(
  styles.includes("dt-nav-slide-in") && styles.includes("dt-nav-slide-out"),
  "base styles must ship the navigation-menu motion keyframes.",
);
assert(
  navDockSource.includes('data-slot="navdock"') &&
    navDockSource.includes('data-slot="navdock-list"') &&
    navDockSource.includes('data-slot="navdock-item"') &&
    navDockSource.includes('data-slot="navdock-link"') &&
    navDockSource.includes('data-slot="navdock-button"') &&
    navDockSource.includes('data-slot="navdock-separator"') &&
    navDockSource.includes('data-slot="navdock-submenu-trigger"') &&
    navDockSource.includes('data-slot="navdock-submenu-content"') &&
    navDockSource.includes('data-slot="navdock-collapse-trigger"'),
  "navdock source must expose stable dock anatomy slots.",
);
assert(
  navDockSource.includes('from "motion/react"') &&
    navDockSource.includes("AnimatePresence") &&
    navDockSource.includes("useSpring") &&
    navDockSource.includes("useReducedMotion"),
  "navdock source must use Motion primitives and reduced-motion detection.",
);
assert(
  navDockSource.includes("aria-current") &&
    navDockSource.includes("aria-expanded") &&
    navDockSource.includes("aria-controls"),
  "navdock source must use link-current and disclosure semantics.",
);
assert(
  navDockSource.includes("CollapseDock") &&
    navDockSource.includes("collapseMode") &&
    navDockSource.includes("triggerIcon"),
  "navdock source must ship explicit collapsed dock composition.",
);
assert(
  navDockSource.includes("NavDockSeparator") &&
    navDockSource.includes("NavDockDivider"),
  "navdock source must ship separator anatomy and compatibility alias.",
);
assert(
  navDockSource.includes("isItemCurrent") &&
    navDockSource.includes("currentValue"),
  "navdock source must support route-derived current matching.",
);
assert(
  navDockSource.includes("bg-background") &&
    navDockSource.includes("focus-visible:ring-ring") &&
    navDockSource.includes("data-[current=true]:text-primary") &&
    navDockSource.includes("motion-safe:transition"),
  "navdock source must use provider tokens and reduced-motion-aware utility classes.",
);
assert(
  !navDockSource.includes("@radix-ui"),
  "navdock source must remain Radix-free.",
);
assert(
  !navDockSource.includes("framer-motion"),
  "navdock source must use motion/react, not framer-motion.",
);
assert(
  !navDockSource.includes("floating-ui"),
  "navdock source must not add Floating UI.",
);
assert(
  sidebarSource.includes("<motionElement.nav") &&
    sidebarSource.includes("AnimatePresence") &&
    sidebarSource.includes("useReducedMotion") &&
    !sidebarSource.includes("transition-[width") &&
    !sidebarSource.includes("animate-sidebar-panel") &&
    !styles.includes("dt-sidebar-panel-in") &&
    !styles.includes("dt-sidebar-panel-out"),
  "sidebar source must use Motion for width and mobile presence choreography without parallel CSS structural animation.",
);
assert(
  sidebarShellSource.includes('from "motion/react"') &&
    sidebarShellSource.includes("var(--dt-density-control)") &&
    sidebarShellSource.includes("var(--dt-density-gap)") &&
    sidebarShellSource.includes("tabIndex = -1"),
  "sidebar-shell source must keep Motion, provider density, and focusable skip-target contracts.",
);
assert(
  packageIndexSource.includes("SidebarShell") &&
    packageIndexSource.includes("SidebarShellMain") &&
    packageIndexSource.includes("SidebarShellNavigation"),
  "root package index must export the SidebarShell family.",
);

console.log("Registry smoke passed.");
