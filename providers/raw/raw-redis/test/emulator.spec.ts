import type { Client as CacheClient } from '@ez4/cache';
import type { CacheService } from '@ez4/cache/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';

import { deepEqual, equal, ok, rejects } from 'node:assert/strict';
import { after, describe, it } from 'node:test';

import { createModule, loadService } from '@ez4/emulator';
import { ServiceType } from '@ez4/cache/library';
import { registerTriggers as registerLocalCache } from '@ez4/local-cache';
import { triggerAllAsync } from '@ez4/project/library';
import { registerTriggers } from '@ez4/raw-redis';
import { Client } from '@ez4/raw-redis/client';

import { prepareEmulatorDescriptor } from '../src/triggers/emulator';

const service: CacheService = {
  type: ServiceType,
  name: 'TestCache',
  engine: { name: 'raw-redis' },
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
    test_cache: { url: 'redis://127.0.0.1:6379' }
  },
  testOptions: {}
};

const context: EmulateServiceContext = {
  makeService: async () => undefined,
  makeReferences: () => ({}),
  makeDescriptors: () => ({})
};

registerLocalCache();
registerTriggers();

describe('cache emulator descriptors', () => {
  it('assert :: exports serializable worker options without creating a client', () => {
    const descriptor = prepareEmulatorDescriptor({ service, options });

    ok(descriptor);
    deepEqual(structuredClone(descriptor), descriptor);
    deepEqual(descriptor, {
      module: '@ez4/raw-redis/worker',
      name: 'makeService',
      options: {
        identifier: 'test-raw-redis-emulator-dev-test-cache',
        prefix: 'test-raw-redis-emulator-dev-test-cache:',
        connection: { url: 'redis://127.0.0.1:6379', token: undefined },
        debug: undefined
      }
    });
  });

  it('assert :: ignores other cache engines', () => {
    const otherService: CacheService = { ...service, engine: { name: 'valkey' } };

    equal(prepareEmulatorDescriptor({ service: otherService, options }), null);
  });

  it('assert :: applies test connection overrides', () => {
    const descriptor = prepareEmulatorDescriptor({
      service,
      options: {
        ...options,
        test: true,
        testOptions: { test_cache: { url: 'http://127.0.0.1:8079', token: 'ez4' } }
      }
    });

    deepEqual(descriptor?.options?.connection, { url: 'http://127.0.0.1:8079', token: 'ez4' });
  });

  it('assert :: reports missing connection settings during service registration', async () => {
    await rejects(
      triggerAllAsync('emulator:getServices', (handler) =>
        handler({
          service: { ...service, name: 'UnconfiguredCache' },
          options: { ...options, localOptions: {} },
          context
        })
      ),
      /EZ4_RAW_REDIS_UNCONFIGURED_CACHE_URL/
    );
  });

  it('assert :: loads the exported worker factory for runner/tester access', async () => {
    const descriptor = prepareEmulatorDescriptor({
      service,
      options: {
        ...options,
        localOptions: { test_cache: { url: 'http://127.0.0.1:8079', token: 'ez4' } }
      }
    });

    ok(descriptor);

    const factory = await loadService<() => CacheClient>({}, descriptor, () => ({
      notify: () => {},
      request: async () => undefined
    }));

    const client = factory();

    try {
      await client.set('runner', '123');
      equal(await client.get('runner'), '123');
    } finally {
      await client.delete('runner');
    }
  });
});

for (const [driver, connection] of [
  ['socket', { url: 'redis://127.0.0.1:6379' }],
  ['rest', { url: 'http://127.0.0.1:8079', token: 'ez4' }]
] as const) {
  describe(`cache emulator lifecycle (${driver})`, () => {
    const localOptions: ServeOptions = {
      ...options,
      projectName: `raw-redis-emulator-${driver}`,
      localOptions: { test_cache: connection }
    };

    const identifier = `test-raw-redis-emulator-${driver}-dev-test-cache`;
    const client = Client.make({ identifier, prefix: `${identifier}:`, connection });
    const otherIdentifier = `${identifier}-other`;
    const otherClient = Client.make({ identifier: otherIdentifier, prefix: `${otherIdentifier}:`, connection });

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
      const emulator = await triggerAllAsync('emulator:getServices', (handler) => handler({ service, options: localOptions, context }));

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
          environment: { timeout: 10, memory: 64 },
          handler: { file: 'test/files/handlers.ts', name: 'cacheHandler', position: [1, 1] },
          invoker: { file: 'test/files/handlers.ts', name: 'makeInvoker' },
          services: { cache: emulator.exportDescriptor() },
          references: { cache: 'cache' }
        });

        equal(await module.invoke({ value: 'worker-value' }), 'worker-value');
        equal(await client.get('worker'), 'worker-value');
      } finally {
        await emulator.shutdownHandler?.();
      }
    });
  });
}
