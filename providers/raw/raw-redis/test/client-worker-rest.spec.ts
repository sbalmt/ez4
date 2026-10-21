import type { CacheService } from '@ez4/cache/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';

import { equal, ok } from 'node:assert/strict';
import { after, describe, it } from 'node:test';

import { createModule } from '@ez4/emulator';
import { ServiceType } from '@ez4/cache/library';
import { registerTriggers as registerLocalCache } from '@ez4/local-cache';
import { triggerAllAsync } from '@ez4/project/library';
import { registerTriggers } from '@ez4/raw-redis';
import { Client } from '@ez4/raw-redis/client';

const service: CacheService = {
  type: ServiceType,
  name: 'TestCache',
  engine: {
    name: 'raw-redis'
  },
  context: {},
  variables: {},
  services: {}
};

const options: ServeOptions = {
  prefix: 'test',
  projectName: 'raw-redis-emulator',
  branchName: 'dev',
  serviceHost: 'localhost',
  version: 1,
  local: true,
  reset: true,
  localOptions: {
    test_cache: {
      url: 'redis://127.0.0.1:6379'
    }
  },
  testOptions: {}
};

const context: EmulateServiceContext = {
  makeService: async () => undefined,
  makeReferences: () => ({}),
  makeDescriptors: () => ({})
};

describe('cache emulator lifecycle (rest)', () => {
  registerLocalCache();
  registerTriggers();

  const connection = {
    url: 'http://127.0.0.1:8079',
    token: 'ez4'
  };

  const localOptions: ServeOptions = {
    ...options,
    projectName: 'raw-redis-emulator-rest',
    localOptions: {
      test_cache: connection
    }
  };

  const identifier = 'test-raw-redis-emulator-rest-dev-test-cache';

  const client = Client.make({
    identifier,
    prefix: `${identifier}:`,
    connection
  });

  const otherIdentifier = `${identifier}-other`;

  const otherClient = Client.make({
    identifier: otherIdentifier,
    prefix: `${otherIdentifier}:`,
    connection
  });

  after(async () => {
    try {
      await client.flush();
      await otherClient.flush();
    } finally {
      Client.dispose(identifier);
      Client.dispose(otherIdentifier);
    }
  });

  it('assert :: registers with local-cache, resets only its prefix and injects workers', async () => {
    const emulator = await triggerAllAsync('emulator:getServices', (handler) =>
      handler({
        service,
        options: localOptions,
        context
      })
    );

    ok(emulator?.exportDescriptor);
    equal(emulator.identifier, identifier);

    await client.set('stale', 'stale');
    await otherClient.set('preserved', 'other');
    await emulator.prepareHandler?.();

    equal(await client.get('stale'), undefined);
    equal(await otherClient.get('preserved'), 'other');

    await emulator.bootstrapHandler?.();

    try {
      const module = createModule({
        environment: {
          timeout: 10,
          memory: 64
        },
        handler: {
          file: 'test/files/handlers.ts',
          name: 'cacheHandler',
          position: [1, 1]
        },
        invoker: {
          file: 'test/files/handlers.ts',
          name: 'makeInvoker'
        },
        services: {
          cache: emulator.exportDescriptor()
        },
        references: {
          cache: 'cache'
        }
      });

      equal(
        await module.invoke({
          value: 'worker-value'
        }),
        'worker-value'
      );
      equal(await client.get('worker'), 'worker-value');
    } finally {
      await emulator.shutdownHandler?.();
    }
  });
});
