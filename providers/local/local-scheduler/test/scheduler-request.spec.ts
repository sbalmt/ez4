import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { ModuleInvocation } from '@ez4/emulator';

import { deepEqual, equal, rejects } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { ServiceType } from '@ez4/scheduler/library';
import { notifyHttpRequest } from '@ez4/server';
import { Logger } from '@ez4/logger';

import { registerLocalService } from '../src/provider/local';
import { makeInvoker } from '../src/worker/invoker';

const service: CronService = {
  type: ServiceType,
  name: 'RequestScheduler',
  context: {},
  variables: {},
  services: {},
  expression: 'dynamic',
  target: { handler: { file: 'unused.ts', name: 'unused', position: [1, 1] } }
};
const options: ServeOptions = {
  prefix: 'test',
  projectName: 'receiving',
  branchName: '',
  serviceHost: 'localhost',
  localOptions: {},
  testOptions: {},
  suppress: true
};

describe('scheduler HTTP requests', () => {
  it('assert :: accepts schema-less triggers before processing and logs later failures', async () => {
    const logged = Promise.withResolvers<void>();
    const errors: string[] = [];
    const errorMock = mock.method(Logger, 'error', (message: string) => {
      errors.push(message);
      if (errors.length === 2) {
        logged.resolve();
      }
    });
    let processingStarted = false;
    const context: EmulateServiceContext = {
      makeService: async () => undefined,
      makeReferences: () => {
        processingStarted = true;
        throw new Error('Target setup failed');
      },
      makeDescriptors: () => ({})
    };
    const emulator = registerLocalService(service, options, context);
    emulator.bootstrapHandler();

    try {
      const response = await notifyHttpRequest(emulator.identifier, { method: 'POST', path: '/' });

      equal(response?.status, 201);
      equal(processingStarted, false);
      deepEqual(errors, []);
      await logged.promise;
      deepEqual(errors, ['Scheduler [RequestScheduler] failed to process event:', '  Error: Target setup failed']);
    } finally {
      emulator.shutdownHandler();
      errorMock.mock.restore();
    }
  });

  it('assert :: preserves body restrictions for schema-less triggers', async () => {
    const emulator = registerLocalService(service, options, {
      makeService: async () => undefined,
      makeReferences: () => ({}),
      makeDescriptors: () => ({})
    });
    emulator.bootstrapHandler();

    try {
      await rejects(notifyHttpRequest(emulator.identifier, { method: 'POST', path: '/', body: '{}' }), /Event body is not required/);
    } finally {
      emulator.shutdownHandler();
    }
  });

  it('assert :: preserves null events for schema-less worker targets', async () => {
    const invoke = mock.fn(async (request: ModuleInvocation['request']) => request.event);
    const invocation: ModuleInvocation = {
      request: { event: null },
      context: {},
      begin: async () => {},
      ready: async () => {},
      invoke,
      done: async () => {},
      error: async () => {},
      end: async () => {}
    };

    equal(await makeInvoker({})(invocation), null);
    equal(invoke.mock.callCount(), 1);
  });
});
