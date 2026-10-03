import { rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createModule, EntrypointNotFoundError, ExecutionTimeoutError, ServiceNotFoundError, WorkerMemoryLimitError } from '@ez4/emulator';

const createTestModule = (handlerName: string, services = {}) => {
  return createModule({
    environment: {
      timeout: 5,
      memory: 32
    },
    handler: {
      file: 'test/files/handlers.ts',
      name: handlerName,
      position: [1, 1]
    },
    manager: {
      file: 'test/files/manager.ts',
      name: 'makeManager'
    },
    services
  });
};

describe('worker errors', { timeout: 10000 }, () => {
  it('assert :: reports a missing handler export from a real worker', async () => {
    const module = createTestModule('missingHandler');

    await rejects(module.invoke({}), EntrypointNotFoundError);
  });

  it('assert :: reports a missing service factory from a real worker', async () => {
    const module = createTestModule('echo', {
      math: {
        file: 'test/files/service.ts',
        name: 'missingFactory'
      }
    });

    await rejects(module.invoke({ value: 'test' }), ServiceNotFoundError);
  });

  it('assert :: reports a worker memory limit error', async () => {
    const module = createTestModule('memory');

    await rejects(module.invoke({}), WorkerMemoryLimitError);
  });

  it('assert :: reports a handler timeout error', async () => {
    const module = createTestModule('timeout');

    await rejects(module.invoke({}), ExecutionTimeoutError);
  });
});
