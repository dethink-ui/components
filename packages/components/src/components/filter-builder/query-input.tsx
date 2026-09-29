import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";
import { cn } from "../../utils/cn";
import { inputClassNames, type InputControlSize } from "../input";
import {
  DEFAULT_FILTER_MAX_DEPTH,
  getFilterQuerySegments,
  getFilterQuerySuggestions,
  getFilterSignature,
  normalizeFilter,
  parseFilterQuery,
  printFilterQuery,
  reconcileFilterIds,
  type FilterQueryError,
  type FilterQueryOptions,
  type FilterQuerySuggestion,
} from "./filter-core";
import type { Filter, FilterFields } from "./filter-types";
import { useFilterState, type FilterState } from "./use-filter-state";
import {
  defaultQueryInputLabels,
  queryInputClassNames,
  queryInputErrorClasses,
  queryInputFieldClasses,
  queryInputListClasses,
  queryInputOptionClasses,
  queryInputOverlayClasses,
  queryInputSizeClasses,
  renderQueryHighlight,
  type QueryInputLabels,
} from "./query-input-parts";

export interface QueryInputProps<TData = unknown> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "size" | "children"
> {
  fields: FilterFields<TData>;
  value?: Filter;
  defaultValue?: Filter;
  onValueChange?: (filter: Filter) => void;
  /**
   * External state from `useFilterState`. Share it with a FilterBar to keep
   * the text and the chips in sync.
   */
  state?: FilterState;
  /** Field that plain words search. Defaults to the first text field. */
  defaultField?: string;
  /** Group levels allowed, counting the root as 1. Defaults to 3. */
  maxDepth?: number;
  labels?: Partial<QueryInputLabels>;
  /** Locale for date suggestions. Defaults to "en-US". */
  locale?: string;
  controlSize?: InputControlSize;
  /** Class for the input element; `className` styles the wrapper. */
  inputClassName?: string;
  /** Called when a commit fails, with the error that is shown. */
  onQueryError?: (error: FilterQueryError) => void;
}

/**
 * One-line text query for a filter, e.g. `status:open created:>-7d
 * (assignee:@me OR labels:bug)`. An ARIA combobox with field, operator and
 * value suggestions, colored tokens and an underlined error range. Commits
 * on Enter or blur; invalid text never changes the filter.
 */
export function QueryInput<TData>({
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  className,
  controlSize = "md",
  defaultField,
  defaultValue,
  disabled,
  fields,
  id: idProp,
  inputClassName,
  labels: labelOverrides,
  locale = "en-US",
  maxDepth = DEFAULT_FILTER_MAX_DEPTH,
  onBlur,
  onFocus,
  onKeyDown,
  onQueryError,
  onValueChange,
  placeholder,
  readOnly,
  state: externalState,
  value,
  ...props
}: QueryInputProps<TData>) {
  const internalState = useFilterState({ defaultValue, onValueChange, value });
  const state = externalState ?? internalState;
  const labels = useMemo(
    () => ({ ...defaultQueryInputLabels, ...labelOverrides }),
    [labelOverrides],
  );
  const schema = fields as FilterFields;
  const options = useMemo<FilterQueryOptions>(
    () => ({ defaultField, maxDepth }),
    [defaultField, maxDepth],
  );
  const printed = useMemo(
    () => printFilterQuery(state.filter, schema, options),
    [options, schema, state.filter],
  );
  // null while the text follows the filter; a string while it is edited.
  const [draft, setDraft] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [caret, setCaret] = useState(0);
  const [syncedFilter, setSyncedFilter] = useState(state.filter);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pendingCaretRef = useRef<number | null>(null);
  const baseId = useId();
  const inputId = idProp ?? `${baseId}-input`;
  const listboxId = `${baseId}-suggestions`;
  const errorId = `${baseId}-error`;

  // Chips, undo or a parent changed the filter: show its text again.
  if (syncedFilter !== state.filter) {
    setSyncedFilter(state.filter);
    setDraft(null);
    setShowError(false);
  }

  // Read-only and disabled inputs never change the text or the filter.
  const editable = !disabled && !readOnly;
  const text = draft ?? printed;
  const parsed = useMemo(
    () =>
      draft === null ? undefined : parseFilterQuery(draft, schema, options),
    [draft, options, schema],
  );
  const error = showError && parsed && !parsed.ok ? parsed.error : undefined;
  const segments = useMemo(
    () => getFilterQuerySegments(text, schema),
    [schema, text],
  );
  const suggestions = useMemo<FilterQuerySuggestion[]>(
    () =>
      open && editable
        ? getFilterQuerySuggestions(text, caret, schema, { ...options, locale })
        : [],
    [caret, editable, locale, open, options, schema, text],
  );
  const expanded = open && suggestions.length > 0;
  const activeSuggestion = expanded ? suggestions[activeIndex] : undefined;

  const syncScroll = () => {
    const input = inputRef.current;

    if (input && overlayRef.current) {
      overlayRef.current.style.transform = `translateX(${-input.scrollLeft}px)`;
    }
  };

  useLayoutEffect(() => {
    const input = inputRef.current;
    const next = pendingCaretRef.current;

    if (input && next !== null) {
      pendingCaretRef.current = null;
      input.setSelectionRange(next, next);
    }

    syncScroll();
  });

  // Keep the active option visible by scrolling the list only; scrolling
  // the option into view would also scroll the page.
  useEffect(() => {
    const list = listRef.current;
    const option = list?.querySelector<HTMLElement>("[data-active]");

    if (!list || !option) {
      return;
    }

    if (option.offsetTop < list.scrollTop) {
      list.scrollTop = option.offsetTop;
    } else if (
      option.offsetTop + option.offsetHeight >
      list.scrollTop + list.clientHeight
    ) {
      list.scrollTop =
        option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [activeIndex, expanded]);

  const updateCaret = () => {
    setCaret(inputRef.current?.selectionStart ?? 0);
    syncScroll();
  };

  const edit = (next: string, nextCaret: number) => {
    if (!editable) {
      return;
    }

    setDraft(next);
    setCaret(nextCaret);
    setActiveIndex(-1);
  };

  const applySuggestion = (suggestion: FilterQuerySuggestion) => {
    if (!editable) {
      return;
    }

    const next =
      text.slice(0, suggestion.start) +
      suggestion.insert +
      text.slice(suggestion.end);
    const nextCaret = suggestion.start + suggestion.insert.length;

    pendingCaretRef.current = nextCaret;
    edit(next, nextCaret);
    setOpen(true);
  };

  const commit = () => {
    if (!editable || draft === null || !parsed) {
      return;
    }

    if (!parsed.ok) {
      setShowError(true);
      onQueryError?.(parsed.error);
      return;
    }

    setShowError(false);

    if (
      getFilterSignature(parsed.filter) !==
      getFilterSignature(normalizeFilter(state.filter))
    ) {
      state.setFilter(reconcileFilterIds(parsed.filter, state.filter));
    } else {
      setDraft(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);

    // Keys that confirm or navigate an IME composition (Japanese, Chinese…)
    // belong to the composition, not to the query.
    if (
      event.defaultPrevented ||
      !editable ||
      event.nativeEvent.isComposing ||
      event.keyCode === 229
    ) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();

        if (!expanded) {
          setOpen(true);
          setActiveIndex(event.key === "ArrowDown" ? 0 : -2);
          return;
        }

        const step = event.key === "ArrowDown" ? 1 : -1;

        setActiveIndex((current) =>
          current < 0 && step < 0
            ? suggestions.length - 1
            : (current + step + suggestions.length) % suggestions.length,
        );
        return;
      }
      case "Enter":
        event.preventDefault();

        if (activeSuggestion) {
          applySuggestion(activeSuggestion);
          return;
        }

        setOpen(false);
        commit();
        return;
      case "Escape":
        if (expanded) {
          event.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
          return;
        }

        if (draft !== null) {
          event.preventDefault();
          setDraft(null);
          setShowError(false);
        }
        return;
      default:
        return;
    }
  };

  // ArrowUp on a closed list opens it on the last suggestion.
  if (activeIndex === -2 && suggestions.length > 0) {
    setActiveIndex(suggestions.length - 1);
  }

  const describedBy =
    [ariaDescribedBy, error ? errorId : undefined].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div
      data-slot="query-input"
      data-invalid={error ? "" : undefined}
      className={queryInputClassNames({ className })}
    >
      <div className="relative">
        <input
          {...props}
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-label={
            ariaLabel ?? (props["aria-labelledby"] ? undefined : labels.input)
          }
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listboxId}
          aria-activedescendant={
            activeSuggestion ? `${listboxId}-${activeIndex}` : undefined
          }
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder ?? labels.placeholder}
          data-slot="query-input-field"
          className={inputClassNames({
            controlSize,
            className: cn(queryInputFieldClasses, inputClassName),
          })}
          value={text}
          onChange={(event) => {
            const input = event.currentTarget;

            edit(input.value, input.selectionStart ?? input.value.length);
            setOpen(true);
          }}
          onSelect={updateCaret}
          onScroll={syncScroll}
          onFocus={(event) => {
            onFocus?.(event);
            updateCaret();
          }}
          onBlur={(event) => {
            onBlur?.(event);
            setOpen(false);
            setActiveIndex(-1);
            commit();
          }}
          onKeyDown={handleKeyDown}
        />
        <div
          aria-hidden="true"
          data-slot="query-input-highlight"
          className={cn(
            queryInputOverlayClasses,
            queryInputSizeClasses[controlSize],
          )}
        >
          <span ref={overlayRef} className="inline-block">
            {renderQueryHighlight(text, segments, error)}
          </span>
        </div>
      </div>
      <div
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label={labels.suggestions}
        data-slot="query-input-suggestions"
        hidden={!expanded}
        className={queryInputListClasses}
      >
        {expanded
          ? suggestions.map((suggestion, index) => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus -- Combobox options stay unfocusable: the input keeps focus and handles keys through aria-activedescendant.
              <div
                key={suggestion.id}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                data-active={index === activeIndex ? "" : undefined}
                data-kind={suggestion.kind}
                className={queryInputOptionClasses}
                onPointerDown={(event) => {
                  // Keep focus (and the caret) in the input.
                  event.preventDefault();
                }}
                onClick={() => {
                  applySuggestion(suggestion);
                }}
                onPointerMove={() => {
                  setActiveIndex(index);
                }}
              >
                <span className="min-w-0 truncate">
                  {suggestion.label}
                  <span className="sr-only">
                    , {labels.suggestionKind[suggestion.kind]}
                  </span>
                </span>
                {suggestion.detail ? (
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground font-mono text-xs"
                  >
                    {suggestion.detail}
                  </span>
                ) : null}
              </div>
            ))
          : null}
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          data-slot="query-input-error"
          className={queryInputErrorClasses}
        >
          {labels.error(error)}
        </p>
      ) : null}
    </div>
  );
}
