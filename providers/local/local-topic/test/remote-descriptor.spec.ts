import type { TopicImport } from '@ez4/topic/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { ServiceFactory } from '@ez4/emulator';

import { deepEqual, equal, notEqual, rejects } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { ImportType, TopicSubscriptionType } from '@ez4/topic/library';
import { notifyHttpRequest } from '@ez4/server';
import { loadService } from '@ez4/emulator';
import { SchemaType } from '@ez4/schema';

import { registerRemoteService } from '../src/provider/remote';

const service: TopicImport = {
  type: ImportType,
  name: 'ImportedTopic',
  reference: 'OriginalTopic',
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
      projectName: 'topics',
      branchName: 'dev',
      serviceHost: 'remote.test:4321'
    }
  }
};
const context: EmulateServiceContext = {
  makeService: async () => undefined,
  makeReferences: () => ({}),
  makeDescriptors: () => ({})
};

describe('remote topic descriptors', () => {
  const emulator = registerRemoteService(service, options, context);

  it('assert :: exports a serializable descriptor with import settings', () => {
    const descriptor = emulator.exportDescriptor();

    deepEqual(JSON.parse(JSON.stringify(descriptor)), descriptor);
    equal(descriptor.options.resourceName, 'OriginalTopic');
    deepEqual(descriptor.options.clientOptions, {
      ...options.imports?.remote,
      remoteHost: options.serviceHost,
      remoteName: service.name
    });
  });

  it('assert :: loads fresh clients and publishes to the imported resource', async () => {
    const factory = await loadService<ServiceFactory>({}, emulator.exportDescriptor(), () => ({
      notify: () => {
        throw new Error('Remote topic must not notify a local provider.');
      },
      request: async () => {
        throw new Error('Remote topic must not request a local provider.');
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
      await first.publishEvent({ value: 'remote' });
      await forwarded.promise;

      deepEqual(requests, [
        {
          url: 'http://remote.test:4321/imported-topics-dev-original-topic',
          body: JSON.stringify({ value: 'remote' })
        }
      ]);
      equal(fetchMock.mock.callCount(), 1);
    } finally {
      fetchMock.mock.restore();
    }
  });

  it('assert :: validates events before publishing them', async () => {
    const factory = await loadService<ServiceFactory>({}, emulator.exportDescriptor(), () => ({
      notify: () => {},
      request: async () => undefined
    }));
    const fetchMock = mock.method(globalThis, 'fetch', async () => new Response(null, { status: 201 }));

    try {
      await rejects(factory().publishEvent({}));
      equal(fetchMock.mock.callCount(), 0);
    } finally {
      fetchMock.mock.restore();
    }
  });

  it('assert :: rejects publishing when the receiving project is unavailable', async () => {
    const factory = await loadService<ServiceFactory>({}, emulator.exportDescriptor(), () => ({
      notify: () => {},
      request: async () => undefined
    }));
    const fetchMock = mock.method(globalThis, 'fetch', async () => {
      throw new Error('Connection refused');
    });

    try {
      await rejects(factory().publishEvent({ value: 'remote' }), /OriginalTopic.*Connection refused/);
    } finally {
      fetchMock.mock.restore();
    }
  });

  it('assert :: rejects publishing when the receiving topic rejects the request', async () => {
    const factory = await loadService<ServiceFactory>({}, emulator.exportDescriptor(), () => ({
      notify: () => {},
      request: async () => undefined
    }));
    const fetchMock = mock.method(globalThis, 'fetch', async () => {
      return Response.json({ message: 'Invalid event' }, { status: 400 });
    });

    try {
      await rejects(factory().publishEvent({ value: 'remote' }), /OriginalTopic.*Invalid event/);
    } finally {
      fetchMock.mock.restore();
    }
  });

  it('assert :: acknowledges imported deliveries without endpoint schema validation before processing', async () => {
    const started = Promise.withResolvers<void>();
    const release = Promise.withResolvers<void>();
    const finished = Promise.withResolvers<void>();
    let processingFinished = false;
    const received: unknown[] = [];
    const imported = registerRemoteService(
      {
        ...service,
        subscriptions: [{ type: TopicSubscriptionType.Queue, service: 'Queue' }]
      },
      { ...options, suppress: true },
      {
        ...context,
        makeService: async () => ({
          sendMessage: async (event: unknown) => {
            received.push(event);
            started.resolve();
            await release.promise;
            processingFinished = true;
            finished.resolve();
          }
        })
      }
    );
    await imported.bootstrapHandler();

    try {
      const response = await notifyHttpRequest(imported.identifier, {
        method: 'POST',
        path: '/',
        body: '{}'
      });

      equal(response?.status, 201);
      equal(received.length, 0);
      await started.promise;
      deepEqual(received, [{}]);
      equal(processingFinished, false);
      release.resolve();
      await finished.promise;
    } finally {
      release.resolve();
      await imported.shutdownHandler();
    }
  });
});
