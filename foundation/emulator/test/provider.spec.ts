import { equal, rejects, throws } from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';

import {
  DuplicateProviderError,
  MissingProviderError,
  notifyProvider,
  providerRegistered,
  registerProvider,
  unregisterProvider
} from '@ez4/emulator';

const TEST_PROVIDER = 'test-unit-provider';
const TEST_EVENT = 'test-event';

const payload = {
  value: 'test'
};

describe('provider tests', () => {
  afterEach(() => {
    if (providerRegistered(TEST_PROVIDER)) {
      unregisterProvider(TEST_PROVIDER);
    }
  });

  it('assert :: unregisters a provider and allows re-registration', async () => {
    registerProvider(TEST_PROVIDER, {
      eventTypes: [TEST_EVENT],
      eventHandler: () => 'original'
    });

    unregisterProvider(TEST_PROVIDER);
    equal(providerRegistered(TEST_PROVIDER), false);

    await rejects(notifyProvider(TEST_PROVIDER, TEST_EVENT, payload), MissingProviderError);

    registerProvider(TEST_PROVIDER, {
      eventTypes: [TEST_EVENT],
      eventHandler: () => 'replacement'
    });

    equal(providerRegistered(TEST_PROVIDER), true);

    equal(await notifyProvider(TEST_PROVIDER, TEST_EVENT, payload), 'replacement');
  });

  it('assert :: rejects duplicate registration without replacing the provider', async () => {
    registerProvider(TEST_PROVIDER, {
      eventTypes: [TEST_EVENT],
      eventHandler: () => 'original'
    });

    throws(
      () =>
        registerProvider(TEST_PROVIDER, {
          eventTypes: [TEST_EVENT],
          eventHandler: () => 'replacement'
        }),
      DuplicateProviderError
    );

    equal(await notifyProvider(TEST_PROVIDER, TEST_EVENT, payload), 'original');
  });

  it('assert :: rejects unregistering a missing provider', () => {
    throws(() => unregisterProvider(TEST_PROVIDER), MissingProviderError);
  });

  it('assert :: rejects notifications for a missing provider', async () => {
    await rejects(notifyProvider(TEST_PROVIDER, TEST_EVENT, payload), MissingProviderError);
  });

  it('assert :: dispatches synchronous events and returns their responses', async () => {
    const response = { value: 'response' };

    const handler = mock.fn((event: string, incoming: typeof payload | undefined) => {
      equal(event, TEST_EVENT);
      equal(incoming, payload);
      return response;
    });

    registerProvider(TEST_PROVIDER, {
      eventTypes: [TEST_EVENT],
      eventHandler: handler
    });

    equal(await notifyProvider(TEST_PROVIDER, TEST_EVENT, payload), response);

    equal(handler.mock.callCount(), 1);
  });

  it('assert :: dispatches asynchronous events and returns their responses', async () => {
    const response = { value: 'response' };

    const handler = mock.fn(async (event: string, incoming: typeof payload | undefined) => {
      equal(event, TEST_EVENT);
      equal(incoming, payload);
      return response;
    });

    registerProvider(TEST_PROVIDER, {
      eventTypes: [TEST_EVENT],
      eventHandler: handler
    });

    equal(await notifyProvider(TEST_PROVIDER, TEST_EVENT, payload), response);

    equal(handler.mock.callCount(), 1);
  });

  it('assert :: dispatches events without a payload or response', async () => {
    const handler = mock.fn((event: string, incoming: typeof payload | undefined) => {
      equal(event, TEST_EVENT);
      equal(incoming, undefined);
    });

    registerProvider(TEST_PROVIDER, {
      eventTypes: [TEST_EVENT],
      eventHandler: handler
    });

    equal(await notifyProvider(TEST_PROVIDER, TEST_EVENT, undefined), undefined);

    equal(handler.mock.callCount(), 1);
  });

  it('assert :: ignores unsupported events without invoking the handler', async () => {
    const handler = mock.fn(() => 'response');

    registerProvider(TEST_PROVIDER, {
      eventTypes: [TEST_EVENT],
      eventHandler: handler
    });

    equal(await notifyProvider(TEST_PROVIDER, 'unsupported-event', payload), undefined);
    equal(handler.mock.callCount(), 0);

    equal(await notifyProvider(TEST_PROVIDER, TEST_EVENT, payload), 'response');
    equal(handler.mock.callCount(), 1);
  });

  it('assert :: ignores all events when no event types are configured', async () => {
    const handler = mock.fn(() => 'response');

    registerProvider(TEST_PROVIDER, {
      eventTypes: [],
      eventHandler: handler
    });

    equal(await notifyProvider(TEST_PROVIDER, TEST_EVENT, payload), undefined);
    equal(handler.mock.callCount(), 0);
  });

  it('assert :: propagates synchronous handler errors', async () => {
    const error = new Error('Provider handler failed.');

    registerProvider(TEST_PROVIDER, {
      eventTypes: [TEST_EVENT],
      eventHandler: () => {
        throw error;
      }
    });

    await rejects(notifyProvider(TEST_PROVIDER, TEST_EVENT, payload), (received: unknown) => received === error);
  });

  it('assert :: propagates asynchronous handler errors', async () => {
    const error = new Error('Provider handler failed.');

    registerProvider(TEST_PROVIDER, {
      eventTypes: [TEST_EVENT],
      eventHandler: async () => {
        throw error;
      }
    });

    await rejects(notifyProvider(TEST_PROVIDER, TEST_EVENT, payload), (received: unknown) => received === error);
  });
});
