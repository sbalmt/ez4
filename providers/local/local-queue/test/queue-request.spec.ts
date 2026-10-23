import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { QueueService } from '@ez4/queue/library';

import { deepEqual, equal, ok } from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { describe, it, mock } from 'node:test';

import { notifyHttpRequest } from '@ez4/server';
import { ServiceType } from '@ez4/queue/library';
import { SchemaType } from '@ez4/schema';
import { Logger } from '@ez4/logger';

import { createRemoteClient } from '../src/client/remote';
import { registerLocalService } from '../src/provider/local';

const service: QueueService = {
  type: ServiceType,
  name: 'ReceivingQueue',
  context: {},
  variables: {},
  services: {},
  subscriptions: [
    {
      handler: {
        file: 'test/files/send.ts',
        name: 'send',
        position: [1, 1]
      }
    }
  ],
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

describe('queue HTTP requests', () => {
  it('assert :: acknowledges remote delivery while the receiving handler is still processing', async () => {
    const started = Promise.withResolvers<void>();
    const release = Promise.withResolvers<void>();
    const finished = Promise.withResolvers<void>();
    const messages: unknown[] = [];
    let processingFinished = false;
    const successMock = mock.method(Logger, 'success', () => {
      processingFinished = true;
      finished.resolve();
    });
    const context: EmulateServiceContext = {
      makeService: async () => undefined,
      makeReferences: () => ({ queue: 'ProcessingQueue' }),
      makeDescriptors: () => ({
        ProcessingQueue: {
          module: '@ez4/local-queue/worker',
          name: 'makeRemoteService',
          options: {
            resourceName: 'ProcessingQueue',
            schema: service.schema,
            clientOptions: receiverOptions
          }
        }
      })
    };
    const emulator = registerLocalService(service, options, context);
    const server = createServer(async (request, response) => {
      const chunks: Buffer[] = [];

      for await (const chunk of request) {
        chunks.push(Buffer.from(chunk));
      }

      if (request.url === `/${emulator.identifier}`) {
        const result = await notifyHttpRequest(emulator.identifier, {
          method: 'POST',
          path: '/',
          body: Buffer.concat(chunks)
        });

        response.writeHead(result?.status ?? 500).end(result?.body);
      } else {
        messages.push(JSON.parse(Buffer.concat(chunks).toString()));
        started.resolve();
        await release.promise;
        response.writeHead(201).end();
      }
    });

    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    ok(address && typeof address !== 'string');
    const receiverOptions = { ...options, serviceHost: `127.0.0.1:${address.port}` };

    await emulator.bootstrapHandler?.();

    try {
      const client = createRemoteClient(service.name, service.schema, receiverOptions);

      await client.sendMessage({ value: 'accepted' });
      await started.promise;

      equal(processingFinished, false);
      deepEqual(messages, [{ value: 'accepted' }]);
      release.resolve();
      await finished.promise;
      equal(processingFinished, true);
    } finally {
      release.resolve();
      await emulator.shutdownHandler?.();
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
      successMock.mock.restore();
    }
  });

  it('assert :: rejects invalid messages before scheduling processing', async () => {
    let processingStarted = false;
    const emulator = registerLocalService(service, options, {
      makeService: async () => undefined,
      makeReferences: () => {
        processingStarted = true;
        return {};
      },
      makeDescriptors: () => ({})
    });

    await emulator.bootstrapHandler?.();

    try {
      const response = await notifyHttpRequest(emulator.identifier, {
        method: 'POST',
        path: '/',
        body: JSON.stringify({})
      });

      equal(response?.status, 400);
      await new Promise<void>((resolve) => setImmediate(resolve));
      equal(processingStarted, false);
    } finally {
      await emulator.shutdownHandler?.();
    }
  });

  it('assert :: logs processing failures after acknowledging the message', async () => {
    const logged = Promise.withResolvers<void>();
    const errors: string[] = [];
    const errorMock = mock.method(Logger, 'error', (message: string) => {
      errors.push(message);
      if (errors.length === 2) {
        logged.resolve();
      }
    });
    const emulator = registerLocalService(service, options, {
      makeService: async () => undefined,
      makeReferences: () => {
        throw new Error('Processing failed');
      },
      makeDescriptors: () => ({})
    });

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
      deepEqual(errors, ['Queue [ReceivingQueue] failed to process message:', '  Error: Processing failed']);
    } finally {
      await emulator.shutdownHandler?.();
      errorMock.mock.restore();
    }
  });
});
