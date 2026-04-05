import { format } from 'prettier';
import { describe, expect, it } from 'vitest';
import plugin from './index.js';

describe('plugin shape', () => {
  it('exports a prettier plugin object with a yaml parser', () => {
    expect(plugin).toBeDefined();
    expect(plugin.parsers).toBeDefined();
    expect(plugin.parsers?.yaml).toBeDefined();
    expect(typeof plugin.parsers?.yaml?.preprocess).toBe('function');
  });
});

describe('plugin integration with prettier', () => {
  it('reflows a long standalone comment when formatting yaml', async () => {
    const input =
      '# one two three four five six seven eight nine ten\nfoo: bar\n';
    const output = await format(input, {
      parser: 'yaml',
      plugins: [plugin],
      printWidth: 20,
    });
    for (const line of output.split('\n').filter((l) => l.length > 0)) {
      expect(line.length).toBeLessThanOrEqual(20);
    }
    expect(output).toContain('foo: bar');
  });

  it('leaves a trailing inline comment alone', async () => {
    const input = "foo: 'value' # trailing comment that is rather long\n";
    const output = await format(input, {
      parser: 'yaml',
      plugins: [plugin],
      printWidth: 20,
    });
    expect(output).toContain('# trailing comment that is rather long');
  });

  it('preserves normal yaml formatting behavior', async () => {
    const input = "foo:\n  bar:\n    baz: 'hi'\n";
    const output = await format(input, {
      parser: 'yaml',
      plugins: [plugin],
      printWidth: 80,
    });
    expect(output).toContain('foo:');
    expect(output).toContain('baz:');
  });
});
