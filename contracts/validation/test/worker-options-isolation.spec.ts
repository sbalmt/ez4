import { equal, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createModule } from '@ez4/emulator';

import { TestLevel } from './cases/options-isolation';

const createTestModule = <T>(handlerName: string, level: TestLevel) => {
  const schema = {
    type: 'object',
    properties: {
      data: {
        type: 'string'
      }
    }
  };

  const handler = {
    file: 'test/cases/options-isolation.ts',
    name: 'testServiceInitializer',
    position: [1, 1]
  };

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
        module: '@ez4/validation/worker',
        name: 'makeService',
        options: {
          schema,
          handler,
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
        module: '@ez4/validation/worker',
        name: 'makeService',
        options: {
          schema,
          handler,
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

describe('validation worker (options isolation test)', () => {
  it('assert :: call first level', async () => {
    const module = createTestModule<boolean>('tryValidateTest', TestLevel.First);

    equal(await module.invoke({ value: { data: 'A' } }), true);
  });

  it('assert :: call first level (validation error)', async () => {
    const module = createTestModule('validateTest', TestLevel.First);

    await rejects(() => module.invoke({ value: { data: 'B' } }), {
      message: 'First level must have data "A".'
    });
  });

  it('assert :: call nested level', async () => {
    const module = createTestModule<boolean>('tryValidateTest', TestLevel.Nested);

    equal(await module.invoke({ value: { data: 'B' } }), true);
  });

  it('assert :: call nested level (validation error)', async () => {
    const module = createTestModule('validateTest', TestLevel.Nested);

    await rejects(() => module.invoke({ value: { data: 'A' } }), {
      message: 'Nested level must have data "B".'
    });
  });
});
