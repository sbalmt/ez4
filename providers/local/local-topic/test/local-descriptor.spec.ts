import type { ServiceFactory } from '@ez4/emulator';

import { deepEqual, equal, notEqual, rejects } from 'node:assert/strict';
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
  module: '@ez4/local-topic/worker',
  provider: 'test-local-topic-descriptor',
  options: {
    identifier: 'test-topic',
    schema
  }
};

describe('local topic descriptors', () => {
  const events: unknown[] = [];

  before(() => {
    registerProvider(descriptor.provider, {
      eventTypes: [ProviderEvent.PublishEvent],
      eventHandler: (_event, payload) => {
        events.push(payload);
      }
    });
  });

  after(() => unregisterProvider(descriptor.provider));

  it('assert :: creates fresh local clients using context notify', async () => {
    const notifications: unknown[] = [];
    const factory = await loadService<ServiceFactory>({}, descriptor, () => ({
      notify: (event, payload) => {
        notifications.push({ event, payload });
      },
      request: async () => undefined
    }));
    const first = factory();
    notEqual(first, factory());

    await first.publishEvent({ value: 'local' });

    deepEqual(notifications, [
      {
        event: ProviderEvent.PublishEvent,
        payload: { event: { value: 'local' } }
      }
    ]);
    await rejects(first.publishEvent({}));
    equal(notifications.length, 1);
  });

  it('assert :: notifies the provider before the publishing worker completes', async () => {
    const module = createModule({
      handler: {
        file: 'test/files/publish.ts',
        name: 'publish',
        position: [1, 1]
      },
      invoker: {
        module: '@ez4/local-topic/worker',
        name: 'makeInvoker',
        options: { schema }
      },
      services: { Topic: descriptor },
      references: { topic: 'Topic' },
      environment: { memory: 64, timeout: 3 }
    });

    await module.invoke({ value: 'worker' });

    deepEqual(events, [{ event: { value: 'worker' } }]);
  });
});
