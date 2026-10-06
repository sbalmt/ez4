import type { AnyObject } from '@ez4/utils';

import { deepEqual, ok, rejects } from 'node:assert/strict';
import { after, before, beforeEach, describe, it, mock } from 'node:test';

import { createModule, registerProvider, unregisterProvider } from '@ez4/emulator';

const TEST_PROVIDER = 'test-provider';

const createTestModule = (handlerName: string) => {
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
    listener: {
      file: 'test/files/listener.ts',
      name: 'listener',
      position: [1, 1]
    },
    manager: {
      provider: TEST_PROVIDER,
      file: 'test/files/manager.ts',
      name: 'makeTestManager',
      options: {
        marker: 'manager-fixture'
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
  let lastProviderEvent: AnyObject | undefined;

  before(() => {
    registerProvider(TEST_PROVIDER, {
      eventTypes: ['test-event'],
      eventHandler: (payload: AnyObject | undefined) => {
        lastProviderEvent = payload;
      }
    });
  });

  beforeEach(() => {
    lastProviderEvent = undefined;
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

  it('assert :: creates and prepares requests with the manager', async () => {
    const module = createTestModule('managed');

    const result = await module.invoke({
      value: 'input'
    });

    deepEqual(result, {
      value: 'input',
      createdByManager: true,
      preparedByManager: true,
      managerOption: 'manager-fixture',
      serviceOption: 10
    });
  });

  it('assert :: receives provider events from worker handler', async () => {
    const module = createTestModule('event');

    await module.invoke({});

    deepEqual(lastProviderEvent, {
      eventMarker: 'foo'
    });
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
