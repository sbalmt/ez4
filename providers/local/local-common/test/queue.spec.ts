import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { processQueueMessage } from '@ez4/local-common';

describe('queue lambda dispatch helper', () => {
  it('assert :: exports process queue lambda message helper', () => {
    equal(typeof processQueueMessage, 'function');
  });
});
