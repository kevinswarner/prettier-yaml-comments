import { describe, expect, it } from 'vitest';
import { getIndent } from './get-indent.js';

describe('getIndent', () => {
  it('returns 0 for lines with no leading whitespace', () => {
    expect(getIndent('# hello')).toBe(0);
  });

  it('counts leading spaces', () => {
    expect(getIndent('    # hello')).toBe(4);
  });

  it('counts a tab as one character', () => {
    expect(getIndent('\t# hello')).toBe(1);
  });

  it('returns 0 for an empty string', () => {
    expect(getIndent('')).toBe(0);
  });
});
