import {
  RE_LEADING_WHITESPACE,
  RE_SEPARATOR_LINE,
  RE_BULLET_MARKER,
  RE_HYPHENATED_DIRECTIVE,
} from './expressions.js';

/**
 * This function takes a single comment line and returns a kind along
 * with its content. A "text" line is ordinary prose that should be
 * reflowed. An "empty" line is a bare `#` that acts as a paragraph
 * break. A "skip" line is a separator, bullet, directive, or shebang
 * that should be emitted verbatim. The caller must ensure the line is
 * a comment line.
 */

export function classify(line: string) {
  const stripped = line.replace(RE_LEADING_WHITESPACE, '');
  const afterHash = stripped.slice(1);

  if (afterHash.startsWith('!')) return { kind: 'skip', text: afterHash };

  const content = afterHash.replace(RE_LEADING_WHITESPACE, '');

  if (content === '') return { kind: 'empty', text: '' };
  if (RE_SEPARATOR_LINE.test(content)) return { kind: 'skip', text: content };
  if (RE_BULLET_MARKER.test(content)) return { kind: 'skip', text: content };
  if (RE_HYPHENATED_DIRECTIVE.test(content))
    return { kind: 'skip', text: content };

  return { kind: 'text', text: content };
}
