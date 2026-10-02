import { deepEqual, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createModule, HandlerTimeoutError, WorkerMemoryLimitError } from '@ez4/emulator';

const createTestModule = (handlerName: string) => {
  return createModule({
    environment: {
      variables: {},
      timeout: 3,
      memory: 32
    },
    handler: {
      file: 'test/files/handlers.ts',
      name: handlerName,
      position: [1, 1]
    },
    listener: {
      file: 'test/files/listener.ts',
      name: 'listener',
      position: [1, 1]
    }
  });
};

describe('worker handler tests', { timeout: 10000 }, () => {
  it('assert :: starts the worker and returns the handler result', async () => {
    const module = createTestModule('echo');

    const result = await module.invoke({
      value: 'worker result'
    });

    deepEqual(result, {
      value: 'worker result'
    });
  });

  it('assert :: handler exceptions through the error signal', async () => {
    const module = createTestModule('exception');

    await rejects(module.invoke({}), {
      name: 'TypeError',
      message: 'Fixture handler failed'
    });
  });

  it('assert :: start errors when the named export is missing', async () => {
    const module = createTestModule('missing');

    await rejects(module.invoke({}), {
      name: 'EntrypointNotFoundError',
      message: "Entrypoint 'missing' was not found in 'test/files/handlers.ts'."
    });
  });

  it('assert :: enforces the worker memory limit', async () => {
    const module = createTestModule('memory');

    await rejects(module.invoke({}), WorkerMemoryLimitError);
  });

  it('assert :: times out a worker invocation', async () => {
    const module = createTestModule('timeout');

    await rejects(module.invoke({}), HandlerTimeoutError);
  });

  it('assert :: concurrent invocations in separate workers', async () => {
    const module = createTestModule('isolation');

    const results = await Promise.all([
      module.invoke({
        value: 'first',
        delay: 50
      }),
      module.invoke({
        value: 'second',
        delay: 10
      })
    ]);

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
