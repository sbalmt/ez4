import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { QueueService } from '@ez4/queue/library';

import { SchemaType } from '@ez4/schema';
import { equal, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { registerQueueEmulator } from '../src/provider/emulator';

const createTestService = (overrides?: Partial<QueueService>): QueueService => {
  return {
    type: '@ez4/queue',
    name: 'TestQueue',
    schema: { type: SchemaType.Object, properties: {} },
    subscriptions: [],
    services: {},
    variables: {},
    context: {},
    ...overrides
  };
};

const createTestOptions = (overrides?: Partial<ServeOptions>): ServeOptions => {
  return {
    prefix: 'ez4',
    projectName: 'test',
    branchName: '',
    localOptions: {},
    testOptions: {},
    variables: {},
    serviceHost: 'localhost',
    version: 1,
    ...overrides
  };
};

const createTestContext = (): EmulateServiceContext => {
  return {
    makeClients: () => Promise.resolve({}),
    makeClient: () => Promise.resolve(null)
  };
};

describe('local queue emulator mode', () => {
  it('assert :: fallback to in-memory client when external provider is absent', async () => {
    const emulator = await registerQueueEmulator(createTestService(), createTestOptions(), createTestContext());

    equal(typeof emulator?.exportHandler().sendMessage, 'function');
  });

  it('assert :: rejects unsupported request method', async () => {
    const emulator = await registerQueueEmulator(createTestService(), createTestOptions(), createTestContext());

    await rejects(() =>
      emulator!.requestHandler({
        method: 'GET',
        path: '/',
        body: Buffer.from('{}')
      })
    );
  });
});
