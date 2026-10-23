import type { QueueImport } from '@ez4/queue/library';
import type { ServeOptions } from '@ez4/project/library';
import type { ServiceFactory } from '@ez4/emulator';

import { deepEqual, equal, notEqual, rejects } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { loadService } from '@ez4/emulator';
import { ImportType } from '@ez4/queue/library';
import { SchemaType } from '@ez4/schema';

import { registerRemoteService } from '../src/provider/remote';

const service: QueueImport = {
  type: ImportType,
  name: 'ImportedQueue',
  reference: 'OriginalQueue',
  project: 'remote',
  context: {},
  variables: {},
  services: {},
  subscriptions: [],
  schema: {
    type: SchemaType.Object,
    properties: { value: { type: SchemaType.String } }
  }
};
const options: ServeOptions = {
  prefix: 'test',
  projectName: 'forwarding',
  branchName: '',
  serviceHost: 'localhost',
  localOptions: {},
  testOptions: {},
  imports: {
    remote: {
      prefix: 'imported',
      projectName: 'queues',
      branchName: 'dev',
      serviceHost: 'remote.test:4321'
    }
  }
};

describe('remote queue descriptors', () => {
  const emulator = registerRemoteService(service, options);

  it('assert :: exports a serializable descriptor with import settings', () => {
    const descriptor = emulator.exportDescriptor();

    deepEqual(JSON.parse(JSON.stringify(descriptor)), descriptor);
    equal(descriptor.options.resourceName, 'OriginalQueue');
    deepEqual(descriptor.options.clientOptions, options.imports?.remote);
  });

  it('assert :: loads fresh clients and forwards to the imported resource', async () => {
    const factory = await loadService<ServiceFactory>({}, emulator.exportDescriptor(), () => ({
      notify: () => {
        throw new Error('Remote queue must not notify a local provider.');
      },
      request: async () => {
        throw new Error('Remote queue must not request a local provider.');
      }
    }));
    const first = factory();
    const second = factory();
    notEqual(first, second);

    const forwarded = Promise.withResolvers<void>();
    const requests: { url: string; body: unknown }[] = [];
    const fetchMock = mock.method(globalThis, 'fetch', async (url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
      requests.push({ url: String(url), body: init?.body });
      forwarded.resolve();
      return new Response(null, { status: 201 });
    });

    try {
      await first.sendMessage({ value: 'remote' });
      await forwarded.promise;

      deepEqual(requests, [
        {
          url: 'http://remote.test:4321/imported-queues-dev-original-queue',
          body: JSON.stringify({ value: 'remote' })
        }
      ]);
      equal(fetchMock.mock.callCount(), 1);
    } finally {
      fetchMock.mock.restore();
    }
  });

  it('assert :: validates messages before forwarding them', async () => {
    const factory = await loadService<ServiceFactory>({}, emulator.exportDescriptor(), () => ({
      notify: () => {},
      request: async () => undefined
    }));
    const fetchMock = mock.method(globalThis, 'fetch', async () => new Response(null, { status: 201 }));

    try {
      await rejects(factory().sendMessage({}));
      equal(fetchMock.mock.callCount(), 0);
    } finally {
      fetchMock.mock.restore();
    }
  });
});
