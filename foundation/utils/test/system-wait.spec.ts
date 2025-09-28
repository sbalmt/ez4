import { ok, equal } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { WaitMaxAttemptsError, Wait } from '@ez4/utils';
import { rejects } from 'node:assert';

describe('system wait utils', () => {
  it('assert :: wait for (success)', async () => {
    const callback = mock.fn(() => true);

    const result = await Wait.until(callback, 10);

    equal(callback.mock.callCount(), 1);

    ok(result);
  });

  it('assert :: wait for (partial failure)', async () => {
    const callback = mock.fn((current, maximum) => (current < maximum ? Wait.RetryAttempt : true));

    const result = await Wait.until(callback, 3);

    equal(callback.mock.callCount(), 3);

    ok(result);
  });

  it('assert :: wait for (failure)', async () => {
    const callback = mock.fn((): Wait.AttemptResult<boolean> => Wait.RetryAttempt);

    rejects(() => Wait.until(callback, 3), WaitMaxAttemptsError);
  });
});
