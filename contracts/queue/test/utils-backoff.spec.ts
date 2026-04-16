import { equal, ok } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getRetryDelay } from '@ez4/queue/utils';

describe('queue backoff utils', () => {
  it('assert :: get retry delay (random time with boundaries)', async () => {
    const minDelay = 5;
    const maxDelay = 120;

    ok(getRetryDelay(1, minDelay, maxDelay) >= minDelay && getRetryDelay(1, minDelay, maxDelay) <= maxDelay);
    ok(getRetryDelay(2, minDelay, maxDelay) >= minDelay && getRetryDelay(1, minDelay, maxDelay) <= maxDelay);
    ok(getRetryDelay(3, minDelay, maxDelay) >= minDelay && getRetryDelay(1, minDelay, maxDelay) <= maxDelay);
  });

  it('assert :: get retry delay (constant time)', async () => {
    const minDelay = 5;
    const maxDelay = 5;

    equal(getRetryDelay(1, minDelay, maxDelay), 5);
    equal(getRetryDelay(2, minDelay, maxDelay), 5);
    equal(getRetryDelay(3, minDelay, maxDelay), 5);
  });
});
