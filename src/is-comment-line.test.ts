import { describe, expect, it } from 'vitest';
import { isCommentLine } from './is-comment-line.js';

describe('isCommentLine', () => {
  it('recognizes a basic comment line', () => {
    expect(isCommentLine('# hello')).toBe(true);
  });

  it('recognizes an indented comment line', () => {
    expect(isCommentLine('    # indented')).toBe(true);
  });

  it("recognizes a bare '#' as a comment line", () => {
    expect(isCommentLine('#')).toBe(true);
    expect(isCommentLine('   #')).toBe(true);
  });

  it('rejects blank lines', () => {
    expect(isCommentLine('')).toBe(false);
    expect(isCommentLine('    ')).toBe(false);
  });

  it('rejects code lines that contain a trailing #', () => {
    expect(isCommentLine('foo: bar # trailing')).toBe(false);
  });

  it('rejects yaml code lines', () => {
    expect(isCommentLine('foo: bar')).toBe(false);
    expect(isCommentLine('- item')).toBe(false);
  });
});
