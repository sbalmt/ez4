import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toKebabCase } from '@ez4/utils';

describe.only('string utils', () => {
  it('assert :: kebab case', () => {
    const result = toKebabCase('Testing KEBAB Case');

    equal(result, 'testing-kebab-case');
  });
});
