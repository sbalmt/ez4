import type { QueueImport } from '@ez4/queue/library';
import type { ServeOptions } from '@ez4/project/library';
import type { ServiceFactory } from '@ez4/emulator';

import { deepEqual, equal, notEqual, rejects } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { loadService } from '@ez4/emulator';
import { ImportType } from '@ez4/queue/library';
import { SchemaType } from '@ez4/schema';
import { notifyHttpRequest } from '@ez4/server';
import { Logger } from '@ez4/logger';

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

  it('assert :: acknowledges HTTP messages before forwarding completes', async () => {
    const started = Promise.withResolvers<void>();
    const response = Promise.withResolvers<Response>();
    const requests: { url: string; body: unknown }[] = [];
    const fetchMock = mock.method(globalThis, 'fetch', (url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
      requests.push({ url: String(url), body: init?.body });
      started.resolve();
      return response.promise;
    });
    emulator.bootstrapHandler();

    try {
      const accepted = await notifyHttpRequest(emulator.identifier, {
        method: 'POST',
        path: '/',
        body: JSON.stringify({ value: 'accepted' })
      });

      equal(accepted?.status, 201);
      equal(fetchMock.mock.callCount(), 0);
      await started.promise;
      deepEqual(requests, [
        {
          url: 'http://remote.test:4321/imported-queues-dev-original-queue',
          body: JSON.stringify({ value: 'accepted' })
        }
      ]);
    } finally {
      response.resolve(new Response(null, { status: 201 }));
      await new Promise<void>((resolve) => setImmediate(resolve));
      emulator.shutdownHandler();
      fetchMock.mock.restore();
    }
  });

  it('assert :: logs client validation failures after acknowledgement without forwarding', async () => {
    const logged = Promise.withResolvers<void>();
    const errors: string[] = [];
    const errorMock = mock.method(Logger, 'error', (message: string) => {
      errors.push(message);
      if (errors.length === 2) {
        logged.resolve();
      }
    });
    const fetchMock = mock.method(globalThis, 'fetch', async () => new Response(null, { status: 201 }));
    emulator.bootstrapHandler();

    try {
      const response = await notifyHttpRequest(emulator.identifier, { method: 'POST', path: '/', body: '{}' });

      equal(response?.status, 201);
      equal(errors.length, 0);
      await logged.promise;
      equal(errors[0], 'Queue [ImportedQueue] failed to forward message:');
      equal(errors[1].includes('Malformed'), true);
      equal(fetchMock.mock.callCount(), 0);
    } finally {
      emulator.shutdownHandler();
      fetchMock.mock.restore();
      errorMock.mock.restore();
    }
  });

  it('assert :: rejects unsupported HTTP requests without forwarding', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => new Response(null, { status: 201 }));
    emulator.bootstrapHandler();

    try {
      for (const request of [
        { method: 'GET', path: '/', body: '{}' },
        { method: 'POST', path: '/unsupported', body: '{}' },
        { method: 'POST', path: '/' }
      ]) {
        await rejects(notifyHttpRequest(emulator.identifier, request), /Unsupported queue request/);
      }

      equal(fetchMock.mock.callCount(), 0);
    } finally {
      emulator.shutdownHandler();
      fetchMock.mock.restore();
    }
  });

  it('assert :: logs forwarding failures after acknowledgement', async () => {
    const logged = Promise.withResolvers<void>();
    const errors: string[] = [];
    const errorMock = mock.method(Logger, 'error', (message: string) => {
      errors.push(message);
      if (errors.length === 2) {
        logged.resolve();
      }
    });
    const fetchMock = mock.method(globalThis, 'fetch', async () => {
      throw new Error('Connection refused');
    });
    emulator.bootstrapHandler();

    try {
      const response = await notifyHttpRequest(emulator.identifier, {
        method: 'POST',
        path: '/',
        body: JSON.stringify({ value: 'accepted' })
      });

      equal(response?.status, 201);
      equal(errors.length, 0);
      await logged.promise;
      equal(errors[0], 'Queue [ImportedQueue] failed to forward message:');
      equal(errors[1].includes('Connection refused'), true);
    } finally {
      emulator.shutdownHandler();
      fetchMock.mock.restore();
      errorMock.mock.restore();
    }
  });
});
