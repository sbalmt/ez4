import type { AnyObject } from '@ez4/utils';

import { deepEqual, rejects } from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

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
      name: 'makeManager',
      options: {
        marker: 'manager-fixture'
      }
    },
    services: {
      testService: {
        provider: TEST_PROVIDER,
        file: 'test/files/service.ts',
        name: 'makeService',
        options: {
          value: 10
        }
      }
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
});
