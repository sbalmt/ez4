import type { ServiceFactory } from '@ez4/emulator';

import { deepEqual, equal, notEqual, rejects, throws } from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { createModule, loadService, registerProvider, unregisterProvider } from '@ez4/emulator';
import { SchemaType } from '@ez4/schema';

import { ProviderEvent } from '../src/types/events';

const schema = {
  type: SchemaType.Object,
  properties: { value: { type: SchemaType.String } }
};
const descriptor = {
  name: 'makeLocalService',
  module: '@ez4/local-queue/worker',
  provider: 'test-local-queue-descriptor',
  options: {
    identifier: 'test-queue',
    schema,
    delay: 4
  }
};

describe('local queue descriptors', () => {
  const events: unknown[] = [];

  before(() => {
    registerProvider(descriptor.provider, {
      eventTypes: [ProviderEvent.PutMessage],
      eventHandler: (_event, payload) => {
        events.push(payload);
      }
    });
  });

  after(() => unregisterProvider(descriptor.provider));

  it('assert :: creates fresh local clients using context notify and default delay', async () => {
    const notifications: unknown[] = [];
    const factory = await loadService<ServiceFactory>({}, descriptor, () => ({
      notify: (event, payload) => {
        notifications.push({ event, payload });
      },
      request: async () => undefined
    }));
    const first = factory();
    notEqual(first, factory());

    await first.sendMessage({ value: 'local' });

    deepEqual(notifications, [
      {
        event: ProviderEvent.PutMessage,
        payload: { message: { value: 'local' }, delay: 4 }
      }
    ]);
    await rejects(first.sendMessage({}));
    equal(notifications.length, 1);
    throws(() => first.receiveMessage(), /isn't supported/);
  });

  it('assert :: preserves per-message delay overrides including zero', async () => {
    const notifications: unknown[] = [];
    const factory = await loadService<ServiceFactory>({}, descriptor, () => ({
      notify: (_event, payload) => {
        notifications.push(payload);
      },
      request: async () => undefined
    }));
    const client = factory();

    await client.sendMessage({ value: 'zero' }, { delay: 0 });
    await client.sendMessage({ value: 'override' }, { delay: 7 });

    deepEqual(notifications, [
      { message: { value: 'zero' }, delay: 0 },
      { message: { value: 'override' }, delay: 7 }
    ]);
  });

  it('assert :: notifies the provider before the sending worker completes', async () => {
    const module = createModule({
      handler: {
        file: 'test/files/send.ts',
        name: 'send',
        position: [1, 1]
      },
      invoker: {
        module: '@ez4/local-queue/worker',
        name: 'makeInvoker',
        options: { schema }
      },
      services: { Queue: descriptor },
      references: { queue: 'Queue' },
      environment: { memory: 64, timeout: 3 }
    });

    await module.invoke({ value: 'worker' });

    deepEqual(events, [{ message: { value: 'worker' }, delay: 0 }]);
  });
});
