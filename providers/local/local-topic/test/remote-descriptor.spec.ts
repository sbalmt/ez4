import type { TopicImport } from '@ez4/topic/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { ServiceFactory } from '@ez4/emulator';

import { deepEqual, equal, notEqual, rejects } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { loadService } from '@ez4/emulator';
import { ImportType } from '@ez4/topic/library';
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
});
