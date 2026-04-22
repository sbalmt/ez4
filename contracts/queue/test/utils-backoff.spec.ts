import { equal, ok } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getRetryDelay } from '@ez4/queue/utils';

describe('queue backoff utils', () => {
  it('assert :: get retry delay (random time with boundaries)', async () => {
    const minDelay = 5;
    const maxDelay = 120;

    const first = getRetryDelay(1, 3, minDelay, maxDelay);
    const second = getRetryDelay(2, 3, minDelay, maxDelay);
    const third = getRetryDelay(3, 3, minDelay, maxDelay);

    ok(first >= 6 && first <= 43);
    ok(second >= 11 && second <= 81);
    ok(third >= 20 && third <= 120);

    // Test retries overflow
    const overflow = getRetryDelay(4, 3, minDelay, maxDelay);

    ok(overflow >= 20 && overflow <= 120);
  });

  it('assert :: get retry delay (constant time)', async () => {
    const minDelay = 5;
    const maxDelay = 5;

    equal(getRetryDelay(1, 3, minDelay, maxDelay), 5);
    equal(getRetryDelay(2, 3, minDelay, maxDelay), 5);
    equal(getRetryDelay(3, 3, minDelay, maxDelay), 5);

    // Test retries overflow
    equal(getRetryDelay(4, 3, minDelay, maxDelay), 5);
  });
});
