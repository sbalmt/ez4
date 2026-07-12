import { ok, equal } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { WaitMaxAttemptsError, Wait } from '@ez4/utils';
import { rejects } from 'node:assert';

describe('system wait utils', { timeout: 180000 }, () => {
  it('assert :: wait until (success)', async () => {
    const callback = mock.fn(() => true);

    const result = await Wait.until(callback);

    equal(callback.mock.callCount(), 1);

    ok(result);
  });

  it('assert :: wait until (partial failure)', async () => {
    const callback = mock.fn((current, maximum) => (current < maximum ? Wait.RetryAttempt : true));

    const result = await Wait.until(callback, {
      attempts: 3,
      minDelay: 1,
      maxDelay: 5
    });

    equal(callback.mock.callCount(), 3);

    ok(result);
  });

  it('assert :: wait until (failure)', async () => {
    const callback = mock.fn((): Wait.Result<boolean> => Wait.RetryAttempt);

    await rejects(() => Wait.until(callback, { attempts: 2 }), WaitMaxAttemptsError);
  });

  it('assert :: retry delay (random time with boundaries)', async () => {
    const minDelay = 5;
    const maxDelay = 120;

    const first = Wait.delay(1, 3, minDelay, maxDelay);
    const second = Wait.delay(2, 3, minDelay, maxDelay);
    const third = Wait.delay(3, 3, minDelay, maxDelay);

    ok(first >= 5 && first <= 44);
    ok(second >= 25 && second <= 82);
    ok(third >= 44 && third <= 120);

    // Test retries overflow
    const overflow = Wait.delay(4, 3, minDelay, maxDelay);

    ok(overflow >= 44 && overflow <= 120);
  });

  it('assert :: retry delay (constant time)', async () => {
    const minDelay = 5;
    const maxDelay = 5;

    equal(Wait.delay(1, 3, minDelay, maxDelay), 5);
    equal(Wait.delay(2, 3, minDelay, maxDelay), 5);
    equal(Wait.delay(3, 3, minDelay, maxDelay), 5);

    // Test retries overflow
    equal(Wait.delay(4, 3, minDelay, maxDelay), 5);
  });
});
