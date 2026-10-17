import type { ServiceReferences } from '@ez4/emulator';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createModule } from '@ez4/emulator';

const createTestModule = <T>(handlerName: string, references: ServiceReferences) => {
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
        module: '@ez4/factory/worker',
        name: 'makeService',
        options: {
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
        module: '@ez4/factory/worker',
        name: 'makeService',
        options: {
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
    references
  });
};

describe('factory worker (circular dependencies test)', () => {
  it('assert :: no call stack size exceeded (when calling A)', async () => {
    const module = createTestModule<string>('invokeTestA', {
      serviceA: 'ServiceA'
    });

    equal(await module.invoke({}), 'AB');
  });

  it('assert :: no call stack size exceeded (when calling B)', async () => {
    const module = createTestModule<string>('invokeTestB', {
      serviceB: 'ServiceB'
    });

    equal(await module.invoke({}), 'BA');
  });
});
