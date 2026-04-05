import { describe, expect, it } from 'vitest';
import { classify } from './classify.js';

describe('classify', () => {
  it('classifies ordinary prose as text', () => {
    expect(classify('# hello world')).toEqual({
      kind: 'text',
      text: 'hello world',
    });
  });

  it('strips extra spaces after the hash', () => {
    expect(classify('#     hello world')).toEqual({
      kind: 'text',
      text: 'hello world',
    });
  });

  it("treats a line with no space after '#' as text", () => {
    expect(classify('#hello')).toEqual({ kind: 'text', text: 'hello' });
  });

  it('classifies an indented comment by its content only', () => {
    expect(classify('      # indented prose')).toEqual({
      kind: 'text',
      text: 'indented prose',
    });
  });

  it("classifies a bare '#' as empty", () => {
    expect(classify('#')).toEqual({ kind: 'empty', text: '' });
    expect(classify('#    ')).toEqual({ kind: 'empty', text: '' });
    expect(classify('   #   ')).toEqual({ kind: 'empty', text: '' });
  });

  it('classifies dash separators as skip', () => {
    expect(classify('# ----').kind).toBe('skip');
    expect(classify('# ---------------').kind).toBe('skip');
  });

  it('classifies other separator chars as skip', () => {
    expect(classify('# ====').kind).toBe('skip');
    expect(classify('# ****').kind).toBe('skip');
    expect(classify('# ~~~~').kind).toBe('skip');
    expect(classify('# ____').kind).toBe('skip');
    expect(classify('# ++++').kind).toBe('skip');
  });

  it('does not classify two-char runs as separators', () => {
    expect(classify('# --').kind).toBe('text');
  });

  it('classifies bullet items as skip', () => {
    expect(classify('# - item one').kind).toBe('skip');
    expect(classify('# * item two').kind).toBe('skip');
    expect(classify('# 1. numbered').kind).toBe('skip');
    expect(classify('# 2) numbered').kind).toBe('skip');
  });

  it('does not treat a dash without trailing space as a bullet', () => {
    expect(classify('# -not-a-bullet').kind).toBe('text');
  });

  it('classifies hyphenated directives as skip', () => {
    expect(classify('# yaml-language-server: $schema=foo').kind).toBe('skip');
    expect(classify('# prettier-ignore').kind).toBe('skip');
  });

  it('classifies shebangs as skip', () => {
    expect(classify('#!/usr/bin/env node').kind).toBe('skip');
  });

  it("does not classify a plain 'word: value' as a directive", () => {
    expect(classify('# note: this is prose').kind).toBe('text');
    expect(classify('# TODO: fix this').kind).toBe('text');
  });
});
