/**
 * Lexer for the filter text query. Splits `status:open,blocked -(a OR b)`
 * into parentheses, negation, OR/AND keywords and terms, keeping character
 * offsets for error ranges, highlighting and autocomplete.
 */

export type FilterQueryTokenKind =
  "lparen" | "rparen" | "not" | "or" | "and" | "term";

export interface FilterQueryToken {
  kind: FilterQueryTokenKind;
  text: string;
  start: number;
  end: number;
}

export interface FilterQuerySpan {
  start: number;
  end: number;
}

/** Parts of a term: `field:` (when present) and the text after it. */
export interface FilterQueryTermParts {
  field?: FilterQuerySpan & { text: string };
  /** Text after `field:`, or the whole term for a bare word. */
  rest: FilterQuerySpan & { text: string };
}

const FIELD_PATTERN = /^([A-Za-z_][\w.-]*):/;

function isSpace(char: string | undefined) {
  return char !== undefined && /\s/.test(char);
}

/** Index after the quoted string that starts at `start`, or -1 if unclosed. */
export function scanQuoted(text: string, start: number) {
  for (let index = start + 1; index < text.length; index += 1) {
    const char = text[index];

    if (char === "\\") {
      index += 1;
    } else if (char === '"') {
      return index + 1;
    }
  }

  return -1;
}

/**
 * Tokens of a query. An unclosed quote runs to the end of the text and is
 * reported as `unclosedQuote` (its opening position), so highlighting and
 * autocomplete still work while it is being typed.
 */
export function lexFilterQuery(text: string): {
  tokens: FilterQueryToken[];
  unclosedQuote?: number;
} {
  const tokens: FilterQueryToken[] = [];
  let unclosedQuote: number | undefined;
  let index = 0;

  const push = (kind: FilterQueryTokenKind, start: number, end: number) => {
    tokens.push({ kind, text: text.slice(start, end), start, end });
  };

  while (index < text.length) {
    const char = text[index];

    if (isSpace(char)) {
      index += 1;
      continue;
    }

    if (char === "(" || char === ")") {
      push(char === "(" ? "lparen" : "rparen", index, index + 1);
      index += 1;
      continue;
    }

    // A leading "-" negates the next term or group.
    if (char === "-") {
      push("not", index, index + 1);
      index += 1;
      continue;
    }

    const start = index;

    while (index < text.length) {
      const current = text[index];

      if (isSpace(current) || current === "(" || current === ")") {
        break;
      }

      if (current === '"') {
        const end = scanQuoted(text, index);

        if (end === -1) {
          unclosedQuote ??= index;
          index = text.length;
          break;
        }

        index = end;
        continue;
      }

      index += 1;
    }

    const word = text.slice(start, index);

    push(word === "OR" ? "or" : word === "AND" ? "and" : "term", start, index);
  }

  return { tokens, unclosedQuote };
}

/** Splits a term into its `field:` prefix and the rest. */
export function splitFilterQueryTerm(
  token: Pick<FilterQueryToken, "text" | "start">,
): FilterQueryTermParts {
  const match = FIELD_PATTERN.exec(token.text);

  if (!match?.[1]) {
    return {
      rest: {
        text: token.text,
        start: token.start,
        end: token.start + token.text.length,
      },
    };
  }

  const fieldEnd = token.start + match[1].length;
  const restStart = fieldEnd + 1;

  return {
    field: { text: match[1], start: token.start, end: fieldEnd },
    rest: {
      text: token.text.slice(match[0].length),
      start: restStart,
      end: token.start + token.text.length,
    },
  };
}

/** Splits list text on commas outside quotes. */
export function splitFilterQueryList(
  text: string,
  offset: number,
): (FilterQuerySpan & { text: string })[] {
  const items: (FilterQuerySpan & { text: string })[] = [];
  let start = 0;
  let index = 0;

  while (index <= text.length) {
    const char = text[index];

    if (char === '"') {
      const end = scanQuoted(text, index);

      index = end === -1 ? text.length : end;
      continue;
    }

    if (char === "," || index === text.length) {
      items.push({
        text: text.slice(start, index),
        start: offset + start,
        end: offset + index,
      });
      start = index + 1;
    }

    index += 1;
  }

  return items;
}
