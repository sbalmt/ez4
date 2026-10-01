import { deepEqual, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createHandler, HandlerTimeoutError, WorkerMemoryLimitError } from '@ez4/emulator';

const createTestHandler = (name: string) => {
  return createHandler({
    environment: {
      variables: {},
      timeout: 3,
      memory: 32
    },
    entrypoint: {
      file: 'test/files/handlers.mjs',
      position: [1, 1],
      name
    }
  });
};

describe('worker handler tests', { timeout: 10000 }, () => {
  it('assert :: starts the worker and returns the handler result', async () => {
    const handler = createTestHandler('echo');

    deepEqual(await handler.invoke('worker result'), {
      value: 'worker result'
    });
  });

  it('assert :: handler exceptions through the error signal', async () => {
    const handler = createTestHandler('exception');

    await rejects(handler.invoke(), {
      name: 'TypeError',
      message: 'fixture handler failed'
    });
  });

  it('assert :: start errors when the named export is missing', async () => {
    const handler = createTestHandler('missing');

    await rejects(handler.invoke(), {
      name: 'EntrypointNotFoundError',
      message: "Entrypoint 'missing' was not found in 'test/files/handlers.mjs'."
    });
  });

  it('assert :: enforces the worker memory limit', async () => {
    const handler = createTestHandler('memory');

    await rejects(handler.invoke(), WorkerMemoryLimitError);
  });

  it('assert :: times out a worker invocation', async () => {
    const handler = createTestHandler('timeout');

    await rejects(handler.invoke(), HandlerTimeoutError);
  });

  it('assert :: concurrent invocations in separate workers', async () => {
    const handler = createTestHandler('isolation');

    const results = await Promise.all([handler.invoke('first', 50), handler.invoke('second', 10)]);

    deepEqual(results, [
      {
        count: 1,
        value: 'first'
      },
      {
        count: 1,
        value: 'second'
      }
    ]);
  });
});
