import type { AnyObject } from '@ez4/utils';

import { deepEqual, equal, ok, rejects } from 'node:assert/strict';
import { after, before, beforeEach, describe, it, mock } from 'node:test';

import { createModule, registerProvider, unregisterProvider } from '@ez4/emulator';

const TEST_PROVIDER = 'test-provider';

const createTestModule = (handlerName: string, listener?: boolean) => {
  return createModule({
    environment: {
      timeout: 3,
      memory: 32
    },
    handler: {
      file: 'test/files/handlers.ts',
      name: handlerName,
      position: [1, 1]
    },
    ...(listener && {
      listener: {
        file: 'test/files/listener.ts',
        name: 'testListener',
        position: [1, 1]
      }
    }),
    invoker: {
      provider: TEST_PROVIDER,
      file: 'test/files/invoker.ts',
      name: 'makeTestInvoker',
      options: {
        marker: 'invoker-fixture'
      }
    },
    services: {
      LazyService: {
        provider: TEST_PROVIDER,
        file: 'test/files/service.ts',
        name: 'makeLazyService',
        options: {
          value: 10
        }
      },
      MathService: {
        provider: TEST_PROVIDER,
        file: 'test/files/service.ts',
        name: 'makeMathService'
      },
      EventService: {
        provider: TEST_PROVIDER,
        file: 'test/files/service.ts',
        name: 'makeEventService'
      }
    },
    references: {
      lazyService: 'LazyService',
      mathService: 'MathService',
      eventService: 'EventService'
    }
  });
};

describe('worker tests', { timeout: 10000 }, () => {
  const lastProviderEvents: AnyObject[] = [];

  before(() => {
    registerProvider(TEST_PROVIDER, {
      eventTypes: ['test-event-1', 'test-event-2', 'test-event-3'],
      eventHandler: (event: string, payload: AnyObject | undefined) => {
        if (payload) {
          lastProviderEvents.push(payload);
        }

        if (event === 'test-event-2') {
          return {
            eventReply: true
          };
        }

        if (event === 'test-event-3') {
          throw new Error('Custom provider error.');
        }

        return;
      }
    });
  });

  beforeEach(() => {
    lastProviderEvents.splice(0);
  });

  after(() => {
    unregisterProvider(TEST_PROVIDER);
  });

  it('assert :: starts the worker and returns the handler result', async () => {
    const module = createTestModule('echo');

    const result = await module.invoke({
      value: 'worker result'
    });

    deepEqual(result, {
      value: 'worker result'
    });
  });

  it('assert :: initializes and injects configured services', async () => {
    const module = createTestModule('service');

    const result = await module.invoke({ x: 8, y: 3 });

    deepEqual(result, {
      sum: 11,
      difference: 5,
      options: {
        value: 10
      }
    });
  });

  it('assert :: creates and prepares requests with the invoker', async () => {
    const module = createTestModule('managed', true);

    const result = await module.invoke({
      value: 'input'
    });

    deepEqual(result, {
      value: 'input',
      createdByInvoker: true,
      preparedByInvoker: true,
      invokerOption: 'invoker-fixture',
      serviceOption: 10
    });
  });

  it('assert :: receives provider events from worker handler', async () => {
    const module = createTestModule('eventForget');

    const result = await module.invoke({});

    equal(result, undefined);

    deepEqual(lastProviderEvents, [
      {
        eventMarker: 'foo'
      }
    ]);
  });

  it('assert :: receives provider event replies in worker handler', async () => {
    const module = createTestModule('eventAwait');

    const result = await module.invoke({});

    deepEqual(result, {
      eventReply: true
    });

    deepEqual(lastProviderEvents, [
      {
        eventMarker: 'bar'
      }
    ]);
  });

  it('assert :: receives provider event errors in worker handler', async () => {
    const module = createTestModule('eventError');

    await rejects(module.invoke({}), {
      message: 'Custom provider error.'
    });

    deepEqual(lastProviderEvents, [
      {
        eventMarker: 'baz'
      }
    ]);
  });

  it('assert :: handler exceptions through the error signal', async () => {
    const module = createTestModule('exception');

    await rejects(module.invoke({}), {
      message: 'Fixture handler failed'
    });
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

  it('assert :: forwards worker stdout and stderr before completing', async () => {
    const stdout = mock.method(process.stdout, 'write');
    const stderr = mock.method(process.stderr, 'write');

    try {
      await createTestModule('logging').invoke({});

      const output = stdout.mock.calls.map(({ arguments: args }) => args[0].toString()).join('');
      const errors = stderr.mock.calls.map(({ arguments: args }) => args[0].toString()).join('');

      ok(output.includes('worker stdout message'));
      ok(errors.includes('worker stderr message'));
    } finally {
      stdout.mock.restore();
      stderr.mock.restore();
    }
  });
});
