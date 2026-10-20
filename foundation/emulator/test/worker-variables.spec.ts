import type { ServiceDescriptors } from '@ez4/emulator';

import { deepEqual, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createModule, DuplicateVariablesError } from '@ez4/emulator';

const createTestModule = (value: string, conflict = false) => {
  const services: ServiceDescriptors = {
    first: {
      file: 'test/files/service.ts',
      name: 'makeLazyService',
      variables: {
        EZ4_WORKER_VALUE: value
      }
    },
    nested: {
      file: 'test/files/service.ts',
      name: 'makeLazyService',
      variables: {
        EZ4_WORKER_VALUE: conflict ? 'conflict' : value,
        EZ4_WORKER_NESTED: 'nested'
      }
    }
  };

  return createModule({
    environment: {
      timeout: 3,
      memory: 32,
      variables: {
        EZ4_WORKER_VALUE: 'project-value',
        EZ4_WORKER_OWN: 'handler-value'
      }
    },
    services,
    handler: {
      file: 'test/files/handlers.ts',
      name: 'environment',
      position: [1, 1]
    },
    invoker: {
      file: 'test/files/invoker.ts',
      name: 'makeDefaultInvoker'
    }
  });
};

describe('worker environment variables', () => {
  it('assert :: merges dependency variables with the worker environment', async () => {
    const environment = { ...process.env };
    const module = createTestModule('factory-value');

    deepEqual(await module.invoke({}), {
      value: 'factory-value',
      nested: 'nested',
      own: 'handler-value',
      path: environment.PATH
    });

    deepEqual({ ...process.env }, environment);
  });

  it('assert :: concurrent workers keep distinct dependency environments', async () => {
    const environment = { ...process.env };

    const first = createTestModule('first');
    const second = createTestModule('second');

    deepEqual(await Promise.all([first.invoke({}), second.invoke({})]), [
      {
        value: 'first',
        nested: 'nested',
        own: 'handler-value',
        path: environment.PATH
      },
      {
        value: 'second',
        nested: 'nested',
        own: 'handler-value',
        path: environment.PATH
      }
    ]);

    deepEqual({ ...process.env }, environment);
  });

  it('assert :: rejects conflicting declarations before starting a worker', async () => {
    const environment = { ...process.env };

    const module = createTestModule('factory-value', true);

    await rejects(module.invoke({}), DuplicateVariablesError);

    deepEqual({ ...process.env }, environment);
  });
});
