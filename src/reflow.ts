import { classify } from './classify.js';
import { getIndent } from './get-indent.js';
import { isCommentLine } from './is-comment-line.js';
import { wrap } from './wrap.js';

/**
 * This function takes a YAML source string and returns it with
 * standalone comment blocks reflowed to fit the given width.
 * Non-comment lines, trailing inline comments, and skip-pattern lines
 * (separators, bullets, directives, shebangs) are left untouched. The
 * function scans line-by-line, groups consecutive comment lines into
 * runs, and rewrites each run using the indent of its first line.
 * The width is measured from column 0, so a deeper indent yields a
 * narrower reflowed width.
 */

export function reflow(source: string, width: number) {
  const lines = source.split('\n');
  const out: string[] = [];

  let i = 0;

  while (i < lines.length) {
    const line = lines[i] as string;

    if (!isCommentLine(line)) {
      out.push(line);
      i++;
      continue;
    }

    let j = i;

    while (j < lines.length && isCommentLine(lines[j] as string)) j++;

    const run = lines.slice(i, j);
    const indent = getIndent(run[0] as string);
    out.push(...reflowRun(run, indent, width));

    i = j;
  }

  return out.join('\n');
}

/**
 * This helper function takes an array of consecutive comment lines
 * and returns the reflowed lines for that run. Text lines are joined
 * and word-wrapped as a single paragraph. A bare `#` is emitted as a
 * paragraph break. A skip-pattern line is emitted verbatim and also
 * acts as a paragraph boundary, flushing any buffered text before it.
 */

function reflowRun(runLines: string[], indent: number, width: number) {
  const out: string[] = [];
  let buffer: string[] = [];

  const indentStr = ' '.repeat(indent);
  const textWidth = width - indent - 2;

  const flush = () => {
    if (buffer.length === 0) return;
    const joined = buffer.join(' ');
    const wrapped = wrap(joined, textWidth);
    for (const piece of wrapped) out.push(indentStr + '# ' + piece);
    buffer = [];
  };

  for (const line of runLines) {
    const c = classify(line);

    if (c.kind === 'text') {
      buffer.push(c.text);
    } else if (c.kind === 'empty') {
      flush();
      out.push(indentStr + '#');
    } else {
      flush();
      out.push(line);
    }
  }

  flush();

  return out;
}
