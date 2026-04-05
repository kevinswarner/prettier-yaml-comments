import { RE_LEADING_WHITESPACE_OPTIONAL } from './expressions.js';

/**
 * This function returns the number of leading whitespace characters
 * in the line (e.g. the indent size.)
 */

export function getIndent(line: string) {
  const match = RE_LEADING_WHITESPACE_OPTIONAL.exec(line);
  return match ? match[0].length : 0;
}
