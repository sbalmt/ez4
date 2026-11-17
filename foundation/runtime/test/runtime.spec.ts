import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Runtime } from '../src/services/runtime';

describe('runtime', () => {
  it('assert :: tracks cold start per invocation', () => {
    Runtime.initialize();

    equal(Runtime.isColdStart(), true);

    Runtime.setScope({
      traceId: 'first'
    });

    equal(Runtime.isColdStart(), true);

    Runtime.setScope({
      traceId: 'second'
    });

    equal(Runtime.isColdStart(), true);

    Runtime.initialize();

    equal(Runtime.isColdStart(), false);
  });
});
