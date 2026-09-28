import { useId, useRef, useState, type ReactNode } from "react";
import { Popover, PopoverContent } from "../popover";
import {
  createFilterCondition,
  createFilterId,
  findFilterNode,
  getDefaultFilterOperator,
  getFilterField,
  isFilterConditionActive,
} from "./filter-core";
import { FilterFieldPicker, FilterValueEditor } from "./filter-editors";
import {
  BackIcon,
  PlusIcon,
  editorBackClasses,
  editorHeaderClasses,
  editorPopoverClasses,
  filterBarActionClassNames,
  useFilterBarContext,
} from "./filter-bar-parts";

export interface FilterAddMenuProps {
  className?: string;
  /** Button content. Defaults to a plus icon and the add label. */
  children?: ReactNode;
  /**
   * Group that receives the new condition. Defaults to the root, where the
   * menu is the bar's primary add menu (shared with the add shortcut).
   */
  parentId?: string;
}

interface AddDraft {
  conditionId: string;
  fieldKey: string;
  session: number;
}

/** "+ Filter" button: pick a field, then a value, in one popover. */
export function FilterAddMenu({
  children,
  className,
  parentId,
}: FilterAddMenuProps) {
  const context = useFilterBarContext("FilterAddMenu");
  const { fields, labels, size, state } = context;
  const isPrimary = parentId === undefined;
  const [localOpen, setLocalOpen] = useState(false);
  const localButtonRef = useRef<HTMLButtonElement>(null);
  const addButtonRef = isPrimary ? context.addButtonRef : localButtonRef;
  const addMenuOpen = isPrimary ? context.addMenuOpen : localOpen;
  const setAddMenuOpen = isPrimary ? context.setAddMenuOpen : setLocalOpen;
  const instanceId = useId();
  const [draft, setDraft] = useState<AddDraft | null>(null);
  const sessionRef = useRef(0);
  const field = draft ? getFilterField(fields, draft.fieldKey) : undefined;
  const operator = field ? getDefaultFilterOperator(field) : undefined;
  const existing = draft
    ? findFilterNode(state.filter, draft.conditionId)
    : undefined;
  const condition = existing?.type === "condition" ? existing : undefined;
  const coalesceKey = draft ? `add:${instanceId}:${draft.session}` : undefined;
  const hasChips = state.filter.children.length > 0;

  const discardIncomplete = () => {
    if (condition && !isFilterConditionActive(condition, fields)) {
      state.removeNode(condition.id, { coalesceKey });
    }
  };

  const close = () => {
    discardIncomplete();
    setDraft(null);
    setAddMenuOpen(false);
  };

  return (
    <>
      <button
        ref={addButtonRef}
        type="button"
        data-filter-bar-item="add"
        data-slot="filter-add-menu-trigger"
        aria-haspopup="dialog"
        aria-expanded={addMenuOpen}
        className={filterBarActionClassNames({
          size,
          variant: "add",
          className,
        })}
        onClick={() => {
          setAddMenuOpen(!addMenuOpen);
        }}
      >
        {children ?? (
          <>
            <PlusIcon />
            {hasChips ? labels.add : labels.addFirst}
          </>
        )}
      </button>
      <Popover
        anchorRef={addButtonRef}
        open={addMenuOpen}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            setAddMenuOpen(true);
          } else {
            close();
          }
        }}
      >
        <PopoverContent
          aria-label={labels.addMenu}
          placement="bottom start"
          className={editorPopoverClasses}
        >
          {field && operator && draft ? (
            <div className="grid min-w-0 gap-[var(--dt-space-2)]">
              <div className={editorHeaderClasses}>
                <button
                  type="button"
                  aria-label={labels.back}
                  className={editorBackClasses}
                  onClick={() => {
                    discardIncomplete();
                    setDraft(null);
                  }}
                >
                  <BackIcon />
                </button>
                <span className="min-w-0 truncate font-medium">
                  {field.label}
                </span>
                <span className="text-muted-foreground shrink-0">
                  {labels.operator(operator, condition?.value)}
                </span>
              </div>
              <FilterValueEditor
                field={field}
                value={condition?.value}
                searchLabel={labels.searchOptions(field.label)}
                emptyLabel={labels.noResults}
                textLabel={labels.textValue(field.label)}
                textPlaceholder={field.placeholder ?? labels.textPlaceholder}
                onValueChange={(value) => {
                  if (condition) {
                    state.updateCondition(
                      condition.id,
                      { value },
                      { coalesceKey },
                    );
                    return;
                  }

                  if (value === undefined) {
                    return;
                  }

                  state.addNode(
                    createFilterCondition({
                      id: draft.conditionId,
                      field: field.key,
                      operator: operator.id,
                      value,
                    }),
                    { coalesceKey, parentId },
                  );
                }}
                onCommit={close}
                onClose={close}
              />
            </div>
          ) : (
            <FilterFieldPicker
              fields={fields}
              searchLabel={labels.searchFields}
              listLabel={labels.fieldList}
              emptyLabel={labels.noResults}
              onClose={close}
              onSelect={(fieldKey) => {
                const nextField = getFilterField(fields, fieldKey);
                const nextOperator = nextField
                  ? getDefaultFilterOperator(nextField)
                  : undefined;

                if (!nextField || !nextOperator) {
                  return;
                }

                sessionRef.current += 1;

                if (nextOperator.arity === "none") {
                  state.addNode(
                    createFilterCondition({
                      field: nextField.key,
                      operator: nextOperator.id,
                    }),
                    { parentId },
                  );
                  setAddMenuOpen(false);
                  return;
                }

                setDraft({
                  conditionId: createFilterId("condition"),
                  fieldKey: nextField.key,
                  session: sessionRef.current,
                });
              }}
            />
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}
