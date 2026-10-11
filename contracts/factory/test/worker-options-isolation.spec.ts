import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createModule } from '@ez4/emulator';

import { TestLevel } from './cases/options-isolation';

const createTestModule = <T>(handlerName: string, level: TestLevel) => {
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
      TestOptions: {
        module: '@ez4/common/worker',
        name: 'makeOptions',
        options: {
          level
        }
      },
      TestService: {
        module: '@ez4/factory/worker',
        name: 'makeService',
        options: {
          handler: {
            file: 'test/cases/options-isolation.ts',
            name: 'testServiceInitializer',
            position: [1, 1]
          },
          references: {
            options: 'TestOptions',
            isolated: 'IsolatedService'
          }
        }
      },
      IsolatedOptions: {
        module: '@ez4/common/worker',
        name: 'makeOptions',
        options: {}
      },
      IsolatedService: {
        module: '@ez4/factory/worker',
        name: 'makeService',
        options: {
          handler: {
            file: 'test/cases/options-isolation.ts',
            name: 'testServiceInitializer',
            position: [1, 1]
          },
          references: {
            options: 'IsolatedOptions'
          }
        }
      }
    },
    references: {
      testService: 'TestService'
    }
  });
};

describe('factory worker (options isolation test)', () => {
  it('assert :: call first level', async () => {
    const module = createTestModule<string>('invokeTestC', TestLevel.First);

    equal(await module.invoke({}), 'A');
  });

  it('assert :: call nested level', async () => {
    const module = createTestModule<string>('invokeTestC', TestLevel.Nested);

    equal(await module.invoke({}), 'B');
  });
});
