import { RE_LEADING_WHITESPACE } from './expressions.js';

/**
 * This function returns true if the line begins with a # or begins
 * with whitespace followed by a #. A blank / whitespace-only line does
 * not qualify.
 */

export function isCommentLine(line: string) {
  const stripped = line.replace(RE_LEADING_WHITESPACE, '');
  return stripped.length > 0 && stripped.startsWith('#');
}
