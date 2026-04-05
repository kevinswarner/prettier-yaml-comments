import { RE_WHITESPACE_RUN } from './expressions.js';

/**
 * This function takes a single string and returns an array of
 * strings by performing a greedy word wrap based on the provided
 * width argument. Words are not broken. If a single word exceeds
 * the width it will occupy its own line and overflow the width
 * budget. Input that is empty or whitespace only will return a
 * single empty line.
 */

export function wrap(text: string, width: number) {
  const words = text.split(RE_WHITESPACE_RUN).filter((word) => word.length > 0);

  if (words.length === 0) return [''];

  const lines: string[] = [];
  let current = words[0] as string;

  for (let i = 1; i < words.length; i++) {
    const word = words[i] as string;
    const candidate = current + ' ' + word;
    if (width >= 1 && candidate.length <= width) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  lines.push(current);

  return lines;
}
