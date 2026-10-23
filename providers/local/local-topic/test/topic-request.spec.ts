import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { TopicService } from '@ez4/topic/library';

import { deepEqual, equal, ok } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { createServer } from 'node:http';
import { once } from 'node:events';

import { ServiceType, TopicSubscriptionType } from '@ez4/topic/library';
import { notifyHttpRequest } from '@ez4/server';
import { createModule } from '@ez4/emulator';
import { SchemaType } from '@ez4/schema';
import { Logger } from '@ez4/logger';

import { registerLocalService } from '../src/provider/local';

const service: TopicService = {
  type: ServiceType,
  name: 'ReceivingTopic',
  context: {},
  variables: {},
  services: {},
  subscriptions: [{ type: TopicSubscriptionType.Queue, service: 'Queue' }],
  schema: {
    type: SchemaType.Object,
    properties: { value: { type: SchemaType.String } }
  }
};

const options: ServeOptions = {
  prefix: 'test',
  projectName: 'receiving',
  branchName: '',
  serviceHost: 'localhost',
  localOptions: {},
  testOptions: {}
};

describe('topic HTTP requests', () => {
  it('assert :: acknowledges a publishing worker before subscriptions complete', async () => {
    const started = Promise.withResolvers<void>();
    const release = Promise.withResolvers<void>();
    const finished = Promise.withResolvers<void>();

    const events: unknown[] = [];

    let processingFinished = false;

    const context: EmulateServiceContext = {
      makeService: async () => ({
        sendMessage: async (event: unknown) => {
          events.push(event);
          started.resolve();
          await release.promise;
          processingFinished = true;
          finished.resolve();
        }
      }),
      makeReferences: () => ({}),
      makeDescriptors: () => ({})
    };

    const emulator = registerLocalService(service, options, context);
    const server = createServer(async (request, response) => {
      const chunks: Buffer[] = [];

      for await (const chunk of request) {
        chunks.push(Buffer.from(chunk));
      }

      const result = await notifyHttpRequest(emulator.identifier, {
        method: request.method!,
        path: '/',
        body: Buffer.concat(chunks)
      });

      response.writeHead(result?.status ?? 500).end(result?.body);
    });

    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    await emulator.bootstrapHandler?.();

    try {
      const address = server.address();
      ok(address && typeof address !== 'string');
      const module = createModule({
        handler: { file: 'test/files/publish.ts', name: 'publish', position: [1, 1] },
        invoker: {
          module: '@ez4/local-topic/worker',
          name: 'makeInvoker',
          options: { schema: service.schema }
        },
        services: {
          Topic: {
            module: '@ez4/local-topic/worker',
            name: 'makeRemoteService',
            options: {
              resourceName: service.name,
              schema: service.schema,
              clientOptions: { ...options, serviceHost: `127.0.0.1:${address.port}` }
            }
          }
        },
        references: { topic: 'Topic' },
        environment: { memory: 64, timeout: 3 }
      });

      await module.invoke({ value: 'accepted' });
      await started.promise;

      deepEqual(events, [{ value: 'accepted' }]);
      equal(processingFinished, false);
      release.resolve();
      await finished.promise;
    } finally {
      release.resolve();
      await emulator.shutdownHandler?.();
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });

  it('assert :: rejects invalid events before scheduling subscriptions', async () => {
    const makeService = mock.fn(async () => undefined);
    const emulator = registerLocalService(service, options, {
      makeService,
      makeReferences: () => ({}),
      makeDescriptors: () => ({})
    });
    await emulator.bootstrapHandler?.();

    try {
      const response = await notifyHttpRequest(emulator.identifier, { method: 'POST', path: '/', body: '{}' });

      equal(response?.status, 400);
      await new Promise<void>((resolve) => setImmediate(resolve));
      equal(makeService.mock.callCount(), 0);
    } finally {
      await emulator.shutdownHandler?.();
    }
  });

  it('assert :: logs subscription failures after acknowledgement', async () => {
    const logged = Promise.withResolvers<void>();
    const errors: string[] = [];
    const errorMock = mock.method(Logger, 'error', (message: string) => {
      errors.push(message);
      if (errors.length === 2) {
        logged.resolve();
      }
    });
    const emulator = registerLocalService(
      {
        ...service,
        subscriptions: [
          {
            type: TopicSubscriptionType.Lambda,
            handler: { file: 'unused.ts', name: 'unused', position: [1, 1] }
          }
        ]
      },
      options,
      {
        makeService: async () => undefined,
        makeReferences: () => {
          throw new Error('Subscription failed');
        },
        makeDescriptors: () => ({})
      }
    );
    await emulator.bootstrapHandler?.();

    try {
      const response = await notifyHttpRequest(emulator.identifier, {
        method: 'POST',
        path: '/',
        body: JSON.stringify({ value: 'accepted' })
      });

      equal(response?.status, 201);
      deepEqual(errors, []);
      await logged.promise;
      deepEqual(errors, ['Topic [ReceivingTopic] failed to process event:', '  Error: Subscription failed']);
    } finally {
      await emulator.shutdownHandler?.();
      errorMock.mock.restore();
    }
  });
});
