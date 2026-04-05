/**
 * One or more leading whitespace characters, anchored to the start.
 */

export const RE_LEADING_WHITESPACE = /^\s+/;

/**
 * Zero or more leading whitespace characters, anchored to the start.
 * Because the quantifier is `*`, this pattern always matches (with an
 * empty match on lines that have no leading whitespace), which makes
 * it safe to read `match[0].length` without a null-check.
 */

export const RE_LEADING_WHITESPACE_OPTIONAL = /^\s*/;

/**
 * A line of 3+ repeating punctuation chars (e.g. "----", "====").
 */

export const RE_SEPARATOR_LINE = /^[-=*~_+]{3,}$/;

/**
 * A leading list marker: '-', '*', '•', or numbered like '1.' / '1)'.
 */

export const RE_BULLET_MARKER = /^([-*•]|\d+[.)])\s/;

/**
 * A hyphenated identifier (2+ segments) optionally followed by a colon.
 * Matches tool directives like "yaml-language-server:" or "prettier-ignore".
 */

export const RE_HYPHENATED_DIRECTIVE =
  /^[A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+(?:\s*:|$)/;

/**
 * A run of one or more whitespace characters. Used to tokenize a
 * string into words by splitting on any stretch of whitespace
 * (spaces, tabs, newlines). Consecutive whitespace is treated as a
 * single delimiter, so `"a   b\tc"` splits into `["a", "b", "c"]`.
 */

export const RE_WHITESPACE_RUN = /\s+/;
