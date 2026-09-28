import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type HTMLAttributes,
} from "react";
import { cn } from "../../utils/cn";
import { Input } from "../input";
import { Popover, PopoverContent } from "../popover";
import {
  filterBarActionClassNames,
  type FilterBarSize,
} from "./filter-bar-parts";
import {
  CheckIcon,
  PencilIcon,
  TrashIcon,
  ViewsIcon,
  defaultSavedViewsMenuLabels,
  savedViewsApplyClasses,
  savedViewsDangerButtonClasses,
  savedViewsDirtyDotClasses,
  savedViewsFooterClasses,
  savedViewsGhostButtonClasses,
  savedViewsHeadingClasses,
  savedViewsIconButtonClasses,
  savedViewsPopoverClasses,
  savedViewsPrimaryButtonClasses,
  savedViewsRowClasses,
  savedViewsSectionClasses,
  type SavedViewsMenuLabels,
} from "./saved-views-parts";
import type {
  SavedView,
  SavedViewScope,
  SavedViewsState,
} from "./use-saved-views";

export interface SavedViewsMenuProps extends Omit<
  HTMLAttributes<HTMLButtonElement>,
  "children"
> {
  /** State from `useSavedViews`. */
  savedViews: SavedViewsState;
  /** Scopes offered when saving a new view. Defaults to personal only. */
  scopes?: SavedViewScope[];
  labels?: Partial<SavedViewsMenuLabels>;
  size?: FilterBarSize;
}

type Mode =
  | { kind: "list" }
  | { kind: "rename"; id: string; name: string }
  | { kind: "confirm"; id: string }
  | { kind: "saveAs"; name: string; scope: SavedViewScope };

const SCOPE_ORDER: (SavedViewScope | "none")[] = ["personal", "team", "none"];

/**
 * Saved views in a popover: apply a view (one undo step), save changes to
 * the active view, save as a new view, rename and delete. The trigger names
 * the active view and marks it edited when the filter has changed.
 */
export function SavedViewsMenu({
  className,
  labels: labelOverrides,
  savedViews,
  scopes = ["personal"],
  size = "md",
  ...props
}: SavedViewsMenuProps) {
  const labels = useMemo(
    () => ({ ...defaultSavedViewsMenuLabels, ...labelOverrides }),
    [labelOverrides],
  );
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const focusAfterRef = useRef<string | null>(null);
  const baseId = useId();
  const nameId = `${baseId}-name`;
  const { activeView, isDirty, views } = savedViews;

  const groups = useMemo(
    () =>
      SCOPE_ORDER.map((scope) => ({
        scope,
        views: views.filter((view) => (view.scope ?? "none") === scope),
      })).filter((group) => group.views.length > 0),
    [views],
  );

  // Move focus to the control a mode change leaves behind.
  useEffect(() => {
    const target = focusAfterRef.current;

    if (!open || target === null) {
      return;
    }

    focusAfterRef.current = null;
    contentRef.current
      ?.querySelector<HTMLElement>(`[data-focus-key="${target}"]`)
      ?.focus();
  });

  const changeMode = (next: Mode, focusKey: string) => {
    focusAfterRef.current = focusKey;
    setMode(next);
  };

  const close = () => {
    setOpen(false);
    setMode({ kind: "list" });
    triggerRef.current?.focus();
  };

  const submitRename = (event: FormEvent, view: SavedView, name: string) => {
    event.preventDefault();

    const trimmed = name.trim();

    if (trimmed) {
      savedViews.rename(view.id, trimmed);
    }

    changeMode({ kind: "list" }, `apply:${view.id}`);
  };

  const submitSaveAs = (
    event: FormEvent,
    name: string,
    scope: SavedViewScope,
  ) => {
    event.preventDefault();

    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    savedViews.saveAs(trimmed, {
      scope: scopes.length > 1 ? scope : scopes[0],
    });
    close();
  };

  const renderRow = (view: SavedView) => {
    const active = view.id === savedViews.activeViewId;

    if (mode.kind === "rename" && mode.id === view.id) {
      return (
        <li key={view.id} data-slot="saved-view">
          <form
            className="flex items-center gap-[var(--dt-space-1)] p-[var(--dt-space-1)]"
            onSubmit={(event) => {
              submitRename(event, view, mode.name);
            }}
          >
            <Input
              aria-label={labels.rename(view.name)}
              data-focus-key={`rename:${view.id}`}
              controlSize="sm"
              value={mode.name}
              onChange={(event) => {
                setMode({ ...mode, name: event.currentTarget.value });
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  event.stopPropagation();
                  changeMode({ kind: "list" }, `apply:${view.id}`);
                }
              }}
            />
            <button type="submit" className={savedViewsPrimaryButtonClasses}>
              {labels.save}
            </button>
          </form>
        </li>
      );
    }

    if (mode.kind === "confirm" && mode.id === view.id) {
      return (
        <li key={view.id} data-slot="saved-view">
          <div
            role="group"
            aria-label={labels.confirmDelete(view.name)}
            className="flex flex-wrap items-center gap-[var(--dt-space-1)] p-[var(--dt-space-1)]"
          >
            <span className="min-w-0 flex-1 truncate px-[var(--dt-space-1)] text-sm">
              {labels.confirmDelete(view.name)}
            </span>
            <button
              type="button"
              data-focus-key={`confirm:${view.id}`}
              className={savedViewsDangerButtonClasses}
              onClick={() => {
                savedViews.remove(view.id);
                changeMode({ kind: "list" }, "save-as");
              }}
            >
              {labels.deleteConfirm}
            </button>
            <button
              type="button"
              className={savedViewsGhostButtonClasses}
              onClick={() => {
                changeMode({ kind: "list" }, `delete:${view.id}`);
              }}
            >
              {labels.cancel}
            </button>
          </div>
        </li>
      );
    }

    return (
      <li
        key={view.id}
        data-slot="saved-view"
        data-active={active ? "" : undefined}
        className={savedViewsRowClasses}
      >
        <button
          type="button"
          data-focus-key={`apply:${view.id}`}
          aria-label={labels.apply(view.name)}
          aria-current={active ? "true" : undefined}
          className={savedViewsApplyClasses}
          onClick={() => {
            savedViews.apply(view.id);
            close();
          }}
        >
          <CheckIcon visible={active} />
          <span className="min-w-0 truncate">{view.name}</span>
        </button>
        <button
          type="button"
          data-focus-key={`rename-button:${view.id}`}
          aria-label={labels.rename(view.name)}
          className={savedViewsIconButtonClasses}
          onClick={() => {
            changeMode(
              { kind: "rename", id: view.id, name: view.name },
              `rename:${view.id}`,
            );
          }}
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          data-focus-key={`delete:${view.id}`}
          aria-label={labels.delete(view.name)}
          className={savedViewsIconButtonClasses}
          onClick={() => {
            changeMode({ kind: "confirm", id: view.id }, `confirm:${view.id}`);
          }}
        >
          <TrashIcon />
        </button>
      </li>
    );
  };

  return (
    <>
      <button
        {...props}
        ref={triggerRef}
        type="button"
        data-slot="saved-views-trigger"
        data-dirty={isDirty ? "" : undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${activeView?.name ?? labels.views}${isDirty ? `, ${labels.edited}` : ""}`}
        className={filterBarActionClassNames({
          size,
          className: cn("text-foreground", className),
        })}
        onClick={() => {
          setMode({ kind: "list" });
          setOpen(!open);
        }}
      >
        <ViewsIcon />
        <span className="max-w-40 truncate">
          {activeView?.name ?? labels.views}
        </span>
        {isDirty ? (
          <span aria-hidden="true" className={savedViewsDirtyDotClasses} />
        ) : null}
      </button>
      <Popover
        anchorRef={triggerRef}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);

          if (!next) {
            setMode({ kind: "list" });
          }
        }}
      >
        <PopoverContent
          aria-label={labels.menu}
          placement="bottom start"
          className={savedViewsPopoverClasses}
        >
          <div ref={contentRef} data-slot="saved-views-menu">
            {groups.length === 0 ? (
              <p className="text-muted-foreground px-[var(--dt-space-2)] py-[var(--dt-space-2)] text-sm">
                {labels.empty}
              </p>
            ) : (
              groups.map((group) => {
                const headingId = `${baseId}-${group.scope}`;

                return (
                  <section
                    key={group.scope}
                    aria-labelledby={headingId}
                    className={savedViewsSectionClasses}
                  >
                    <h3 id={headingId} className={savedViewsHeadingClasses}>
                      {group.scope === "none"
                        ? labels.unscoped
                        : labels.scope[group.scope]}
                    </h3>
                    <ul className={savedViewsSectionClasses}>
                      {group.views.map(renderRow)}
                    </ul>
                  </section>
                );
              })
            )}
            <div className={savedViewsFooterClasses}>
              {activeView ? (
                <button
                  type="button"
                  data-focus-key="save"
                  disabled={!isDirty}
                  className={savedViewsGhostButtonClasses}
                  onClick={() => {
                    savedViews.save();
                    close();
                  }}
                >
                  {labels.saveChanges}
                </button>
              ) : null}
              {mode.kind === "saveAs" ? (
                <form
                  className="grid gap-[var(--dt-space-2)] p-[var(--dt-space-1)]"
                  onSubmit={(event) => {
                    submitSaveAs(event, mode.name, mode.scope);
                  }}
                >
                  <label htmlFor={nameId} className="text-xs font-medium">
                    {labels.viewName}
                  </label>
                  <Input
                    id={nameId}
                    data-focus-key="save-as-name"
                    controlSize="sm"
                    value={mode.name}
                    onChange={(event) => {
                      setMode({ ...mode, name: event.currentTarget.value });
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.preventDefault();
                        event.stopPropagation();
                        changeMode({ kind: "list" }, "save-as");
                      }
                    }}
                  />
                  {scopes.length > 1 ? (
                    <fieldset className="flex flex-wrap items-center gap-[var(--dt-space-3)] text-sm">
                      <legend className="sr-only">{labels.scopeLabel}</legend>
                      <span aria-hidden="true" className="text-xs font-medium">
                        {labels.scopeLabel}
                      </span>
                      {scopes.map((scope) => (
                        <label
                          key={scope}
                          className="inline-flex items-center gap-[var(--dt-space-1-5)]"
                        >
                          <input
                            type="radio"
                            name={`${baseId}-scope`}
                            value={scope}
                            checked={mode.scope === scope}
                            onChange={() => {
                              setMode({ ...mode, scope });
                            }}
                          />
                          {labels.scope[scope]}
                        </label>
                      ))}
                    </fieldset>
                  ) : null}
                  <div className="flex justify-end gap-[var(--dt-space-1)]">
                    <button
                      type="button"
                      className={savedViewsGhostButtonClasses}
                      onClick={() => {
                        changeMode({ kind: "list" }, "save-as");
                      }}
                    >
                      {labels.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={mode.name.trim() === ""}
                      className={savedViewsPrimaryButtonClasses}
                    >
                      {labels.save}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  data-focus-key="save-as"
                  className={savedViewsGhostButtonClasses}
                  onClick={() => {
                    changeMode(
                      {
                        kind: "saveAs",
                        name: "",
                        scope: scopes[0] ?? "personal",
                      },
                      "save-as-name",
                    );
                  }}
                >
                  {labels.saveAs}
                </button>
              )}
              {activeView ? (
                <button
                  type="button"
                  className={savedViewsGhostButtonClasses}
                  onClick={() => {
                    savedViews.deselect();
                    close();
                  }}
                >
                  {labels.clear}
                </button>
              ) : null}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
