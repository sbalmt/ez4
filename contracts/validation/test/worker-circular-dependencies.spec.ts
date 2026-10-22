import { equal, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createModule } from '@ez4/emulator';

const createTestModule = <T>(handlerName: string, testService: string) => {
  return createModule<T>({
    environment: {
      timeout: 3,
      memory: 32
    },
    handler: {
      file: 'test/files/handlers.ts',
      name: handlerName,
      position: [1, 1]
    },
    invoker: {
      file: 'test/files/invoker.ts',
      name: 'makeInvoker'
    },
    services: {
      ServiceA: {
        module: '@ez4/validation/worker',
        name: 'makeService',
        options: {
          schema: {
            type: 'object',
            properties: {}
          },
          handler: {
            file: 'test/cases/circular-dependencies.ts',
            name: 'testServiceAInitializer',
            position: [1, 1]
          },
          references: {
            serviceB: 'ServiceB'
          }
        }
      },
      ServiceB: {
        module: '@ez4/validation/worker',
        name: 'makeService',
        options: {
          schema: {
            type: 'object',
            properties: {}
          },
          handler: {
            file: 'test/cases/circular-dependencies.ts',
            name: 'testServiceBInitializer',
            position: [1, 1]
          },
          references: {
            serviceA: 'ServiceA'
          }
        }
      }
    },
    references: {
      testService
    }
  });
};

describe('validation worker (circular dependencies test)', () => {
  it('assert :: no call stack size exceeded (when calling A)', async () => {
    const module = createTestModule<boolean>('tryValidateTest', 'ServiceA');

    equal(await module.invoke({ value: { nameA: 'A', nameB: 'B' } }), true);
  });

  it('assert :: no call stack size exceeded (when calling B)', async () => {
    const module = createTestModule<boolean>('tryValidateTest', 'ServiceB');

    equal(await module.invoke({ value: { nameA: 'A', nameB: 'B' } }), true);
  });

  it('assert :: validation error (when calling A)', async () => {
    const module = createTestModule('validateTest', 'ServiceA');

    await rejects(() => module.invoke({ value: { nameA: 'A' } }), {
      message: 'Missing input name B'
    });
  });

  it('assert :: validation error (when calling B)', async () => {
    const module = createTestModule('validateTest', 'ServiceB');

    await rejects(() => module.invoke({ value: { nameB: 'B' } }), {
      message: 'Missing input name A'
    });
  });
});
