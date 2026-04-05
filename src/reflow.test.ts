import { describe, expect, it } from 'vitest';
import { reflow } from './reflow.js';

describe('reflow — non-comment content', () => {
  it('returns non-comment content unchanged', () => {
    const src = 'foo: bar\nbaz:\n  - one\n  - two\n';
    expect(reflow(src, 80)).toBe(src);
  });

  it('preserves blank lines between items', () => {
    const src = 'foo: bar\n\nbaz: qux\n';
    expect(reflow(src, 80)).toBe(src);
  });

  it('leaves trailing inline comments untouched, even if overly long', () => {
    const src = "foo: 'value' # this is a very long trailing comment\n";
    expect(reflow(src, 20)).toBe(src);
  });

  it('preserves a trailing newline', () => {
    expect(reflow('foo: bar\n', 80)).toBe('foo: bar\n');
  });

  it('handles input with no trailing newline', () => {
    expect(reflow('foo: bar', 80)).toBe('foo: bar');
  });
});

describe('reflow — single comment lines', () => {
  it('leaves a short comment untouched (besides space normalization)', () => {
    expect(reflow('# hello world\n', 80)).toBe('# hello world\n');
  });

  it("normalizes multiple spaces after '#' to a single space", () => {
    expect(reflow('#     hello world\n', 80)).toBe('# hello world\n');
  });

  it("adds a space after '#' when none is present", () => {
    expect(reflow('#hello world\n', 80)).toBe('# hello world\n');
  });

  it('wraps a single long comment to respect printWidth', () => {
    const input = '# one two three four five six seven eight\n';
    const output = reflow(input, 20);
    const lines = output.split('\n').filter((l) => l.length > 0);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(20);
    }
    expect(output).toBe('# one two three four\n# five six seven\n# eight\n');
  });
});

describe('reflow — multiline comments', () => {
  it('joins a multiline comment and reflows as one paragraph', () => {
    const input =
      '# this is also an independent comment. one difference here is it is part of a\n' +
      '# multiline comment. so the comment is really a single comment, but broken up\n' +
      '# into multiple lines.\n';
    const output = reflow(input, 45);
    const lines = output.split('\n').filter((l) => l.length > 0);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(45);
    }
    const joined = lines.map((l) => l.replace(/^# /, '')).join(' ');
    expect(joined).toBe(
      'this is also an independent comment. one difference here is it is part of a multiline comment. so the comment is really a single comment, but broken up into multiple lines.'
    );
  });

  it("matches the user's 45-column example", () => {
    const input =
      '# First line of a multiline comment. Second lint of a multilie comment.\n';
    const output = reflow(input, 45);
    expect(output).toBe(
      '# First line of a multiline comment. Second\n# lint of a multilie comment.\n'
    );
  });

  it('treats a blank line as a run boundary (two separate comments)', () => {
    const input = '# first comment\n\n# second comment\n';
    expect(reflow(input, 80)).toBe(input);
  });

  it('does not join a comment with a following code line', () => {
    const input = '# a comment\nfoo: bar\n';
    expect(reflow(input, 80)).toBe(input);
  });
});

describe('reflow — indentation', () => {
  it('preserves the indent on a single indented comment', () => {
    expect(reflow('    # hello\n', 80)).toBe('    # hello\n');
  });

  it("uses the first line's indent for a multiline comment", () => {
    const input = '# first line\n  # second line at indent 2\n';
    expect(reflow(input, 80)).toBe('# first line second line at indent 2\n');
  });

  it('uses indent of first line even when it is deeper than later lines', () => {
    const input = '    # first at indent 4\n# second at indent 0\n';
    expect(reflow(input, 80)).toBe(
      '    # first at indent 4 second at indent 0\n'
    );
  });

  it('respects total printWidth when indented (not printWidth + indent)', () => {
    const input = '        # one two three four five six seven\n';
    const output = reflow(input, 30);
    const lines = output.split('\n').filter((l) => l.length > 0);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(30);
    }
    expect(output).toBe(
      '        # one two three four\n        # five six seven\n'
    );
  });

  it("reflowed indented comment is emitted at the first line's indent", () => {
    const input =
      '  # alpha beta gamma delta epsilon zeta eta theta iota kappa lambda\n';
    const output = reflow(input, 30);
    for (const line of output.split('\n').filter((l) => l.length > 0)) {
      expect(line.startsWith('  # ')).toBe(true);
      expect(line.length).toBeLessThanOrEqual(30);
    }
  });
});

describe('reflow — paragraph breaks inside a comment run', () => {
  it("preserves bare '#' as a paragraph break and reflows each side", () => {
    const input =
      '# first para line one. first para line two.\n' +
      '#\n' +
      '# second paragraph text.\n';
    const output = reflow(input, 80);
    expect(output).toBe(
      '# first para line one. first para line two.\n' +
        '#\n' +
        '# second paragraph text.\n'
    );
  });

  it('reflows paragraphs independently', () => {
    const input = '# a b c d e f g h i j\n#\n# k l m n o p q r s t\n';
    const output = reflow(input, 12);
    expect(output).toBe(
      '# a b c d e\n# f g h i j\n#\n# k l m n o\n# p q r s t\n'
    );
  });

  it('preserves the indent on the paragraph break line', () => {
    const input = '    # first\n    #\n    # second\n';
    expect(reflow(input, 80)).toBe('    # first\n    #\n    # second\n');
  });
});

describe('reflow — skip patterns (separators, bullets, directives)', () => {
  it('leaves a separator line untouched', () => {
    const input = '# ----------------\n';
    expect(reflow(input, 80)).toBe(input);
  });

  it('does not reflow text that follows a separator into it', () => {
    const input = '# section header\n# ----------------\n# body text here\n';
    expect(reflow(input, 80)).toBe(input);
  });

  it('keeps bullets as verbatim lines but still processes adjacent prose', () => {
    const input =
      '# intro paragraph that is fairly long and should wrap nicely\n' +
      '# - first bullet\n' +
      '# - second bullet\n' +
      '# closing paragraph that is also fairly long and should wrap\n';
    const output = reflow(input, 30);
    const lines = output.split('\n').filter((l) => l.length > 0);
    expect(lines).toContain('# - first bullet');
    expect(lines).toContain('# - second bullet');
    for (const line of lines) {
      if (line.startsWith('# - ')) continue;
      expect(line.length).toBeLessThanOrEqual(30);
    }
  });

  it('keeps a shebang line verbatim', () => {
    const input = '#!/usr/bin/env node\n# a following comment\n';
    expect(reflow(input, 80)).toBe(input);
  });

  it('keeps a hyphenated directive verbatim', () => {
    const input =
      '# yaml-language-server: $schema=https://example.com/schema.json\n' +
      'foo: bar\n';
    expect(reflow(input, 30)).toBe(input);
  });

  it("keeps 'prettier-ignore' verbatim", () => {
    const input = "# prettier-ignore\nfoo: 'bar'\n";
    expect(reflow(input, 80)).toBe(input);
  });
});

describe('reflow — long / unbreakable words', () => {
  it('lets a word longer than the available width overflow its own line', () => {
    const input =
      '# short https://example.com/very/long/path/that/cannot/break more\n';
    const output = reflow(input, 20);
    const lines = output.split('\n').filter((l) => l.length > 0);
    expect(lines).toEqual([
      '# short',
      '# https://example.com/very/long/path/that/cannot/break',
      '# more',
    ]);
  });

  it('allows overflow when the URL is the first word too', () => {
    const input =
      '# https://example.com/very/long/path/that/cannot/break trailing\n';
    const output = reflow(input, 20);
    expect(output).toBe(
      '# https://example.com/very/long/path/that/cannot/break\n# trailing\n'
    );
  });
});

describe('reflow — user-provided examples', () => {
  it('matches the indent-rule example from the spec', () => {
    const input =
      '# First line of a multiline comment.\n  # Second line of a multiline comment.\n';
    expect(reflow(input, 80)).toBe(
      '# First line of a multiline comment. Second line of a multiline comment.\n'
    );
  });

  it("leaves a fully-formed yaml file's non-comment parts untouched", () => {
    const input =
      '# This is an independent comment.\n' +
      '\n' +
      'foo:\n' +
      "  bar: 'Hello There' # I am not interested in this kind of comment.\n" +
      '\n' +
      'baz:\n' +
      '  # I am interested in this comment even though it is indented.\n' +
      "  bar: 'Hello There'\n";
    expect(reflow(input, 80)).toBe(input);
  });
});
