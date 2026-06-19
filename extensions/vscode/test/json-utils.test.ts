import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getJsonPath } from '../src/webview/utils/json';

describe('extension json utils', () => {
  const JSON_INPUT = `{"foo":1,"bar":{"bar_foo":"2","bar_bar":[]},"baz":[[],{"baz_foo":3},[{"baz_bar":"4"}]]}`;

  it('assert :: find property (incomplete)', () => {
    const result = getJsonPath(JSON_INPUT, 6); // Before ':'

    deepEqual(result, {
      depth: 1,
      path: []
    });
  });

  it('assert :: find property (complete)', () => {
    const result = getJsonPath(JSON_INPUT, 7); // After ':'

    deepEqual(result, {
      path: ['foo'],
      depth: 0
    });
  });

  it('assert :: find next complete property (outside object)', () => {
    const result = getJsonPath(JSON_INPUT, 15);

    deepEqual(result, {
      path: ['bar'],
      depth: 0
    });
  });

  it('assert :: find next complete property (inside object)', () => {
    const result = getJsonPath(JSON_INPUT, 16);

    deepEqual(result, {
      path: ['bar'],
      depth: 1
    });
  });

  it('assert :: find nested complete property (outside object -> array)', () => {
    const result = getJsonPath(JSON_INPUT, 40);

    deepEqual(result, {
      path: ['bar', 'bar_bar'],
      depth: 0
    });
  });

  it('assert :: find nested complete property (inside object -> array)', () => {
    const result = getJsonPath(JSON_INPUT, 41);

    deepEqual(result, {
      path: ['bar', 'bar_bar'],
      depth: 1
    });
  });

  it('assert :: find deep complete property (array -> object)', () => {
    const result = getJsonPath(JSON_INPUT, 66);

    deepEqual(result, {
      path: ['baz', 'baz_foo'],
      depth: 1
    });
  });

  it('assert :: find deep complete property (array -> array -> object)', () => {
    const result = getJsonPath(JSON_INPUT, 81);

    deepEqual(result, {
      path: ['baz', 'baz_bar'],
      depth: 2
    });
  });
});
