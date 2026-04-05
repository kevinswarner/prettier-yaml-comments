# prettier-yaml-comments

A Prettier plugin that reflows standalone comment blocks in YAML files to
respect `printWidth`. All other YAML formatting is delegated to Prettier's
built-in YAML parser and printer.

## Install

```sh
pnpm add -D prettier prettier-yaml-comments
```

## Usage

Add the plugin to your Prettier config:

```json
{
  "plugins": ["prettier-yaml-comments"],
  "printWidth": 80
}
```

Then format YAML files as usual:

```sh
pnpm prettier --write "**/*.yaml"
```

## What it does

Given a YAML file like this with `printWidth: 45`:

```yaml
# This is a long standalone comment that is too wide for the configured print width and will be reflowed.
foo: bar
```

The plugin rewrites the comment to:

```yaml
# This is a long standalone comment that is
# too wide for the configured print width
# and will be reflowed.
foo: bar
```

## Rules

- Only standalone comment lines are touched. Trailing inline comments
  (`foo: bar # note`) are left alone.
- Consecutive comment lines form a single multiline comment and are reflowed
  together as one paragraph.
- The indent of the first line in a comment block is used as the indent for the
  reflowed output.
- `printWidth` is measured from column 0, so a deeper indent yields a narrower
  reflowed width.
- A bare `#` inside a multiline comment is a paragraph break.
- Separators (`# ----`), bullets (`# - item`), shebangs (`#!...`), and
  hyphenated directives (`# yaml-language-server: ...`) are emitted verbatim and
  act as paragraph boundaries.
- Words are never broken. A word longer than the available width overflows its
  line.

## License

MIT
