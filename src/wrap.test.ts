import { describe, expect, it } from 'vitest';
import { wrap } from './wrap.js';

describe('wrap', () => {
  it('returns a single empty line for empty input', () => {
    expect(wrap('', 80)).toEqual(['']);
  });

  it('returns a single empty line for whitespace-only input', () => {
    expect(wrap('   \t  ', 80)).toEqual(['']);
  });

  it('returns the input as a single line when it fits', () => {
    expect(wrap('hello world', 80)).toEqual(['hello world']);
  });

  it('collapses internal whitespace to single spaces', () => {
    expect(wrap('hello   world\t\tfoo', 80)).toEqual(['hello world foo']);
  });

  it('wraps greedily at word boundaries', () => {
    expect(wrap('hello world foo bar', 11)).toEqual(['hello world', 'foo bar']);
  });

  it('puts a word that exceeds width on its own line and overflows', () => {
    expect(wrap('a supercalifragilistic b', 10)).toEqual([
      'a',
      'supercalifragilistic',
      'b',
    ]);
  });

  it('handles a single long word as one overflowing line', () => {
    expect(wrap('supercalifragilistic', 5)).toEqual(['supercalifragilistic']);
  });

  it('puts one word per line when width < 1', () => {
    expect(wrap('a b c', 0)).toEqual(['a', 'b', 'c']);
    expect(wrap('a b c', -5)).toEqual(['a', 'b', 'c']);
  });

  it('never breaks words, even when width equals 1', () => {
    expect(wrap('aa bb cc', 1)).toEqual(['aa', 'bb', 'cc']);
  });

  it('respects an exact-fit line', () => {
    expect(wrap('one two three', 7)).toEqual(['one two', 'three']);
  });
});
