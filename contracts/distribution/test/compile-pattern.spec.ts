import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { compileRewritePattern } from '@ez4/distribution/library';

describe('compile rewrite pattern', () => {
  it('assert :: exact pattern', () => {
    equal(compileRewritePattern('/path/page'), '^/path/page$');
  });

  it('assert :: exact pattern (with negation)', () => {
    equal(compileRewritePattern('/path/!page/file'), '^/path/(?!page/)([^/]+)/file$');
  });

  it('assert :: exact pattern (with final negation)', () => {
    equal(compileRewritePattern('/path/!page'), '^/path/(?!page$)(.+)$');
  });

  it('assert :: wildcard pattern', () => {
    equal(compileRewritePattern('/path/*'), '^/path/(.+)$');
  });

  it('assert :: wildcard pattern (with prefix)', () => {
    equal(compileRewritePattern('/path/file.*'), '^/path/file\\.(.+)$');
  });

  it('assert :: wildcard pattern (with suffix)', () => {
    equal(compileRewritePattern('/path/*.ext'), '^/path/(.+)\\.ext$');
  });

  it('assert :: wildcard pattern (with prefix negation)', () => {
    equal(compileRewritePattern('/path/!admin-*/file'), '^/path/(?!admin\-(.+)/)([^/]+)/file$');
  });

  it('assert :: wildcard pattern (with suffix negation)', () => {
    equal(compileRewritePattern('/path/!*-admin/file'), '^/path/(?!(.+)\-admin/)([^/]+)/file$');
  });

  it('assert :: wildcard pattern (with final prefix negation)', () => {
    equal(compileRewritePattern('/path/!file.*'), '^/path/(?!file\\.(.+)$)(.+)$');
  });

  it('assert :: wildcard pattern (with final suffix negation)', () => {
    equal(compileRewritePattern('/path/!*.ext'), '^/path/(?!(.+)\\.ext$)(.+)$');
  });

  it('assert :: options pattern', () => {
    equal(compileRewritePattern('/path/{a|b|c}'), '^/path/(?:a|b|c)$');
  });

  it('assert :: options pattern (with negation)', () => {
    equal(compileRewritePattern('/path/!{a|b|c}/page'), '^/path/(?!(?:a|b|c)/)([^/]+)/page$');
  });

  it('assert :: options pattern (with final negation)', () => {
    equal(compileRewritePattern('/path/!{a|b|c}'), '^/path/(?!(?:a|b|c)$)(.+)$');
  });
});
