import type { ParserOptions, Plugin } from 'prettier';
import { parsers as yamlParsers } from 'prettier/plugins/yaml';
import { reflow } from './reflow.js';

/**
 * This plugin wraps Prettier's built-in YAML parser and adds a
 * preprocess step that reflows standalone comment blocks to respect
 * the configured print width. All other YAML formatting is delegated
 * to Prettier's own parser and printer, so regular structure, values,
 * and trailing inline comments are unchanged.
 */

const baseYamlParser = yamlParsers.yaml;

const plugin: Plugin = {
  parsers: {
    yaml: {
      ...baseYamlParser,
      preprocess: (text: string, options: ParserOptions) => {
        const basePreprocess = baseYamlParser.preprocess;
        const pre =
          typeof basePreprocess === 'function'
            ? (basePreprocess(text, options) as string)
            : text;
        return reflow(pre, options.printWidth);
      },
    },
  },
};

export default plugin;
