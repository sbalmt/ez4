import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers } from '@ez4/local-elasticmq';

describe('local elasticmq package', () => {
  it('assert :: exports trigger registration', () => {
    equal(typeof registerTriggers, 'function');
  });
});
