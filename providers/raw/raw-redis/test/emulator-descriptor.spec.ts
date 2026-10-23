import type { Client as CacheClient } from '@ez4/cache';
import type { CacheService } from '@ez4/cache/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';

import { deepEqual, equal, ok, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { loadService } from '@ez4/emulator';
import { ServiceType } from '@ez4/cache/library';
import { registerTriggers as registerLocalCache } from '@ez4/local-cache';
import { triggerAllAsync } from '@ez4/project/library';
import { registerTriggers } from '@ez4/raw-redis';

import { prepareEmulatorDescriptor } from '../src/triggers/emulator';

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

describe('cache emulator descriptors', () => {
  registerLocalCache();
  registerTriggers();

  it('assert :: exports serializable worker options without creating a client', () => {
    const descriptor = prepareEmulatorDescriptor({
      service,
      options
    });

    ok(descriptor);

    deepEqual(structuredClone(descriptor), descriptor);

    deepEqual(descriptor, {
      module: '@ez4/raw-redis/worker',
      name: 'makeService',
      options: {
        identifier: 'test-raw-redis-emulator-dev-test-cache',
        prefix: 'test-raw-redis-emulator-dev-test-cache:',
        connection: {
          url: 'redis://127.0.0.1:6379',
          token: undefined
        },
        debug: undefined
      }
    });
  });

  it('assert :: ignores other cache engines', () => {
    const otherService: CacheService = {
      ...service,
      engine: {
        name: 'valkey'
      }
    };

    const descriptor = prepareEmulatorDescriptor({
      service: otherService,
      options
    });

    equal(descriptor, null);
  });

  it('assert :: applies test connection overrides', () => {
    const descriptor = prepareEmulatorDescriptor({
      service,
      options: {
        ...options,
        test: true,
        testOptions: {
          test_cache: {
            url: 'http://127.0.0.1:8079',
            token: 'ez4'
          }
        }
      }
    });

    deepEqual(descriptor?.options?.connection, {
      url: 'http://127.0.0.1:8079',
      token: 'ez4'
    });
  });

  it('assert :: reports missing connection settings during service registration', async () => {
    await rejects(
      triggerAllAsync('emulator:getServices', (handler) =>
        handler({
          service: {
            ...service,
            name: 'UnconfiguredCache'
          },
          options: {
            ...options,
            localOptions: {}
          },
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
        localOptions: {
          test_cache: {
            url: 'http://127.0.0.1:8079',
            token: 'ez4'
          }
        }
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
