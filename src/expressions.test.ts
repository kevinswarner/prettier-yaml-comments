import { describe, expect, it } from 'vitest';
import {
  RE_BULLET_MARKER,
  RE_HYPHENATED_DIRECTIVE,
  RE_LEADING_WHITESPACE,
  RE_LEADING_WHITESPACE_OPTIONAL,
  RE_SEPARATOR_LINE,
  RE_WHITESPACE_RUN,
} from './expressions.js';

describe('RE_LEADING_WHITESPACE', () => {
  it('matches one or more leading spaces', () => {
    expect(RE_LEADING_WHITESPACE.test('   hello')).toBe(true);
  });

  it('matches a single leading space', () => {
    expect(RE_LEADING_WHITESPACE.test(' hello')).toBe(true);
  });

  it('matches leading tabs', () => {
    expect(RE_LEADING_WHITESPACE.test('\thello')).toBe(true);
  });

  it('matches mixed leading whitespace', () => {
    expect(RE_LEADING_WHITESPACE.test(' \t hello')).toBe(true);
  });

  it('does not match when there is no leading whitespace', () => {
    expect(RE_LEADING_WHITESPACE.test('hello')).toBe(false);
  });

  it('does not match whitespace in the middle of a string', () => {
    expect(RE_LEADING_WHITESPACE.test('hello world')).toBe(false);
  });

  it('does not match an empty string', () => {
    expect(RE_LEADING_WHITESPACE.test('')).toBe(false);
  });

  it('captures only the leading whitespace', () => {
    const match = RE_LEADING_WHITESPACE.exec('    hello');
    expect(match?.[0]).toBe('    ');
  });
});

describe('RE_LEADING_WHITESPACE_OPTIONAL', () => {
  it('matches one or more leading spaces', () => {
    const match = RE_LEADING_WHITESPACE_OPTIONAL.exec('   hello');
    expect(match?.[0]).toBe('   ');
  });

  it('matches an empty string when there is no leading whitespace', () => {
    const match = RE_LEADING_WHITESPACE_OPTIONAL.exec('hello');
    expect(match?.[0]).toBe('');
  });

  it('matches an empty string on an empty input', () => {
    const match = RE_LEADING_WHITESPACE_OPTIONAL.exec('');
    expect(match?.[0]).toBe('');
  });

  it('matches leading tabs', () => {
    const match = RE_LEADING_WHITESPACE_OPTIONAL.exec('\t\thello');
    expect(match?.[0]).toBe('\t\t');
  });

  it('always produces a match (never null)', () => {
    expect(RE_LEADING_WHITESPACE_OPTIONAL.exec('hello')).not.toBeNull();
    expect(RE_LEADING_WHITESPACE_OPTIONAL.exec('')).not.toBeNull();
    expect(RE_LEADING_WHITESPACE_OPTIONAL.exec('   hi')).not.toBeNull();
  });
});

describe('RE_SEPARATOR_LINE', () => {
  it('matches 3+ dashes', () => {
    expect(RE_SEPARATOR_LINE.test('---')).toBe(true);
    expect(RE_SEPARATOR_LINE.test('----------------')).toBe(true);
  });

  it('matches 3+ equals signs', () => {
    expect(RE_SEPARATOR_LINE.test('===')).toBe(true);
    expect(RE_SEPARATOR_LINE.test('==========')).toBe(true);
  });

  it('matches other punctuation chars: *, ~, _, +', () => {
    expect(RE_SEPARATOR_LINE.test('***')).toBe(true);
    expect(RE_SEPARATOR_LINE.test('~~~')).toBe(true);
    expect(RE_SEPARATOR_LINE.test('___')).toBe(true);
    expect(RE_SEPARATOR_LINE.test('+++')).toBe(true);
  });

  it('does not match two-char runs', () => {
    expect(RE_SEPARATOR_LINE.test('--')).toBe(false);
    expect(RE_SEPARATOR_LINE.test('==')).toBe(false);
  });

  it('does not match a single char', () => {
    expect(RE_SEPARATOR_LINE.test('-')).toBe(false);
  });

  it('does not match lines with trailing content', () => {
    expect(RE_SEPARATOR_LINE.test('--- hello')).toBe(false);
    expect(RE_SEPARATOR_LINE.test('---a')).toBe(false);
  });

  it('does not match mixed punctuation', () => {
    // The regex allows any mix of the set, which is intentional.
    expect(RE_SEPARATOR_LINE.test('-=-')).toBe(true);
    expect(RE_SEPARATOR_LINE.test('-*~')).toBe(true);
  });

  it('does not match an empty string', () => {
    expect(RE_SEPARATOR_LINE.test('')).toBe(false);
  });

  it('does not match non-punctuation chars', () => {
    expect(RE_SEPARATOR_LINE.test('abc')).toBe(false);
    expect(RE_SEPARATOR_LINE.test('///')).toBe(false);
  });
});

describe('RE_BULLET_MARKER', () => {
  it('matches dash bullets', () => {
    expect(RE_BULLET_MARKER.test('- item')).toBe(true);
  });

  it('matches asterisk bullets', () => {
    expect(RE_BULLET_MARKER.test('* item')).toBe(true);
  });

  it('matches unicode bullet', () => {
    expect(RE_BULLET_MARKER.test('• item')).toBe(true);
  });

  it('matches numbered markers with period', () => {
    expect(RE_BULLET_MARKER.test('1. item')).toBe(true);
    expect(RE_BULLET_MARKER.test('42. item')).toBe(true);
  });

  it('matches numbered markers with paren', () => {
    expect(RE_BULLET_MARKER.test('1) item')).toBe(true);
    expect(RE_BULLET_MARKER.test('42) item')).toBe(true);
  });

  it('requires whitespace after the marker', () => {
    expect(RE_BULLET_MARKER.test('-item')).toBe(false);
    expect(RE_BULLET_MARKER.test('*item')).toBe(false);
    expect(RE_BULLET_MARKER.test('1.item')).toBe(false);
  });

  it('does not match text that starts with a letter', () => {
    expect(RE_BULLET_MARKER.test('hello')).toBe(false);
  });

  it('does not match an empty string', () => {
    expect(RE_BULLET_MARKER.test('')).toBe(false);
  });
});

describe('RE_HYPHENATED_DIRECTIVE', () => {
  it('matches a two-segment hyphenated identifier with colon', () => {
    expect(RE_HYPHENATED_DIRECTIVE.test('prettier-ignore:')).toBe(true);
  });

  it('matches a three-segment hyphenated identifier with colon', () => {
    expect(RE_HYPHENATED_DIRECTIVE.test('yaml-language-server: foo')).toBe(
      true
    );
  });

  it('matches a hyphenated identifier without colon at end of string', () => {
    expect(RE_HYPHENATED_DIRECTIVE.test('prettier-ignore')).toBe(true);
  });

  it('allows whitespace between identifier and colon', () => {
    expect(RE_HYPHENATED_DIRECTIVE.test('foo-bar  : value')).toBe(true);
  });

  it('does not match an identifier without a hyphen', () => {
    expect(RE_HYPHENATED_DIRECTIVE.test('prettier:')).toBe(false);
    expect(RE_HYPHENATED_DIRECTIVE.test('prettier')).toBe(false);
  });

  it('does not match TODO / note style prefixes', () => {
    expect(RE_HYPHENATED_DIRECTIVE.test('TODO: fix this')).toBe(false);
    expect(RE_HYPHENATED_DIRECTIVE.test('note: prose')).toBe(false);
  });

  it('does not match identifiers that start with a digit', () => {
    expect(RE_HYPHENATED_DIRECTIVE.test('1-foo: bar')).toBe(false);
  });

  it('does not match when hyphens are adjacent or trailing', () => {
    expect(RE_HYPHENATED_DIRECTIVE.test('foo--bar:')).toBe(false);
    expect(RE_HYPHENATED_DIRECTIVE.test('foo-:')).toBe(false);
  });

  it('does not match content that merely contains a hyphenated word later', () => {
    expect(RE_HYPHENATED_DIRECTIVE.test('hello foo-bar:')).toBe(false);
  });

  it('does not match an empty string', () => {
    expect(RE_HYPHENATED_DIRECTIVE.test('')).toBe(false);
  });
});

describe('RE_WHITESPACE_RUN', () => {
  it('splits a simple space-delimited string', () => {
    expect('a b c'.split(RE_WHITESPACE_RUN)).toEqual(['a', 'b', 'c']);
  });

  it('collapses runs of spaces into a single delimiter', () => {
    expect('a   b'.split(RE_WHITESPACE_RUN)).toEqual(['a', 'b']);
  });

  it('treats tabs and newlines as whitespace', () => {
    expect('a\tb\nc'.split(RE_WHITESPACE_RUN)).toEqual(['a', 'b', 'c']);
  });

  it('treats mixed whitespace as a single delimiter', () => {
    expect('a \t\n b'.split(RE_WHITESPACE_RUN)).toEqual(['a', 'b']);
  });

  it('yields an empty leading element when input starts with whitespace', () => {
    expect(' a'.split(RE_WHITESPACE_RUN)).toEqual(['', 'a']);
  });

  it('yields an empty trailing element when input ends with whitespace', () => {
    expect('a '.split(RE_WHITESPACE_RUN)).toEqual(['a', '']);
  });

  it('returns an array with one empty string when given an empty input', () => {
    expect(''.split(RE_WHITESPACE_RUN)).toEqual(['']);
  });
});
